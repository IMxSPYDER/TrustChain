import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../web3/abi.json";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;

const RecoverAccount = () => {
  const [oldWallet, setOldWallet] = useState("");
  const [newWallet, setNewWallet] = useState("");

  const submitRecovery = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractABI,
      signer
      );

    // 1️⃣ Start recovery on-chain (timestamp stored)
    const tx = await contract.startRecovery(newWallet);
    await tx.wait();

    // 2️⃣ Trigger guardian emails
    await fetch("http://localhost:5000/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldWallet, newWallet })
      });

      alert("Recovery started. Waiting for guardian approvals.");
    };


  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">Recover Account</h2>

      <input
        placeholder="Old Wallet Address"
        onChange={(e) => setOldWallet(e.target.value)}
        className="block mt-4 p-2"
      />

      <input
        placeholder="New Wallet Address"
        onChange={(e) => setNewWallet(e.target.value)}
        className="block mt-4 p-2"
      />

      <button onClick={submitRecovery} className="mt-4 bg-blue-600 text-white p-2">
        Submit Recovery Request
      </button>
    </div>
  );
};

export default RecoverAccount;
