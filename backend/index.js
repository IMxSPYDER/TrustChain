require("dotenv").config();
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("fs");
const GUARDIAN_FILE = "./guardians.json";



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const SALT = "STATIC_SALT";

let approvals = {};
let tokens = {};
const { ethers } = require("ethers");
const abi = require("./abi.json");

const provider = new ethers.JsonRpcProvider("https://sepolia.optimism.io");
const wallet = new ethers.Wallet(process.env.BACKEND_PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  abi,
  wallet
);


app.post("/register", (req, res) => {
  const { wallet, guardians } = req.body;

  if (!wallet || !guardians || guardians.length < 2) {
    return res.status(400).send("Invalid data");
  }

  let data = {};
  if (fs.existsSync(GUARDIAN_FILE)) {
    data = JSON.parse(fs.readFileSync(GUARDIAN_FILE));
  }

  data[wallet.toLowerCase()] = guardians.map(g => g.toLowerCase());

  fs.writeFileSync(GUARDIAN_FILE, JSON.stringify(data, null, 2));

  res.send("Guardian emails saved");
});


app.post("/recover", async (req, res) => {
  try {
    let { oldWallet, newWallet } = req.body;
    oldWallet = oldWallet.toLowerCase().trim();

    const data = JSON.parse(fs.readFileSync(GUARDIAN_FILE));
    const guardianEmails = data[oldWallet];

    if (!guardianEmails || guardianEmails.length < 2) {
      return res.status(400).send("No guardian emails found");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "tpanchal5555@gmail.com",
        pass: "ghmo dtvq suwz kerf"
      }
    });


    for (let email of guardianEmails) {
      const token = crypto.randomBytes(32).toString("hex");
      const guardianHash = ethers.keccak256(
        ethers.toUtf8Bytes(email.toLowerCase() + SALT)
      );

      tokens[token] = { oldWallet, guardianHash };

      const link = `http://localhost:5000/approve?token=${token}`;

      await transporter.sendMail({
        from: '"TrustChain" <tpanchal5555@gmail.com>',
        to: email,
        subject: "Account Recovery Request",
        text: `Recovery requested.\nOld: ${oldWallet}\nNew: ${newWallet}\n\nApprove:\n${link}`
      });
    }

    res.send("Recovery emails sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Recovery failed");
  }
});


app.get("/approve", async (req, res) => {
  try {

    const token = req.query.token;
    if (!token || !tokens[token]) {
      return res.send("Invalid or expired token");
    }

    const { oldWallet, guardianHash } = tokens[token];

    const tx = await contract.approveRecovery(oldWallet, guardianHash);
    await tx.wait();

    console.log("Guardian approval confirmed");

    delete tokens[token];

    const recovery = await contract.recoveryRequests(oldWallet);

    if (recovery.approvals >= 2 && !recovery.executed) {

      const now = Math.floor(Date.now() / 1000);
      const startTime = Number(recovery.startTime);

      if (now >= startTime + 60) {

        const tx2 = await contract.executeRecovery(oldWallet);
        await tx2.wait();

        console.log("Recovery executed automatically");
      }
    }

    res.send(`
    <html>
    <head>
    <title>Recovery Approval</title>
    <style>
    body{
    font-family: Arial;
    background:#0f172a;
    color:white;
    display:flex;
    justify-content:center;
    align-items:center;
    height:100vh;
    }
    .card{
    background:#1e293b;
    padding:40px;
    border-radius:10px;
    text-align:center;
    box-shadow:0 0 10px rgba(0,0,0,0.5);
    }
    h1{
    color:#22c55e;
    }
    </style>
    </head>

    <body>

    <div class="card">
    <h1> Approval Successful</h1>
    <p>You have successfully approved the recovery request.</p>
    <p>The system will complete recovery once enough guardians approve.</p>
    </div>

    </body>
    </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send("Approval failed");
  }
});


app.post("/execute", async (req, res) => {
  const { oldWallet } = req.body;
  await contract.executeRecovery(oldWallet);
  res.send("Recovery executed");
});

console.log("PK:", process.env.BACKEND_PRIVATE_KEY);

app.listen(5000, () => console.log("Backend running"));
