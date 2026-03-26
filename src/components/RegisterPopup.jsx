import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { FaUserShield, FaUniversity } from "react-icons/fa";
import contractABI from "../web3/abi.json";



const RegisterPopup = ({ account, contractAddress }) => {
  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [guardian1, setGuardian1] = useState("");
  const [guardian2, setGuardian2] = useState("");
  const [guardian3, setGuardian3] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setShowForm(true);
  };


  const SALT = "STATIC_SALT";

  const hashGuardian = (email) =>
  ethers.keccak256(
    ethers.toUtf8Bytes(email.toLowerCase() + SALT)
  );

  const handleRegister = async (e) => {
  e.preventDefault();

  try {
    setLoading(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    // DEBUG CHECK
    const code = await provider.getCode(contractAddress);
    if (code === "0x") {
      throw new Error("Contract not deployed on this network");
    }

    const isRegistered = await contract.isUserRegistered(signerAddress);
    if (isRegistered) {
      alert("Already registered");
      navigate("/login");
      return;
    }

    const tx = await contract.registerUser(
      name,
      email,
      role === "user" ? 0 : 1
    );
    await tx.wait();

    const guardianHashes = [
    hashGuardian(guardian1),
    hashGuardian(guardian2),
    hashGuardian(guardian3),
    ];

    const tx2 = await contract.registerGuardians(guardianHashes);
    await tx2.wait();

    await fetch("http://localhost:5000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet: signerAddress,
      guardians: [guardian1, guardian2, guardian3]
      })
    });

    alert("Registration successful");

  } catch (err) {
    console.error(err);
    alert(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 backdrop-blur-lg bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2f] p-8 rounded-2xl shadow-2xl w-full max-w-3xl text-white border border-gray-700">
        {!showForm ? (
          // ----------- ROLE SELECTION UI -----------
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Select Your Role</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border border-dashed border-gray-600 p-6 rounded-lg">
              {/* User */}
              <div
                className="cursor-pointer bg-[#2a2a40] hover:bg-[#343454] p-6 rounded-xl transition"
                onClick={() => handleRoleSelect("user")}
              >
                <div className="flex flex-col items-center justify-center">
                  <FaUserShield size={40} className="text-blue-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User</h3>
                  <p className="text-sm text-gray-300 text-center">
                    Browse and interact with blockchain-based services securely.
                  </p>
                </div>
              </div>

              {/* University */}
              <div
                className="cursor-pointer bg-[#2a2a40] hover:bg-[#343454] p-6 rounded-xl transition"
                onClick={() => handleRoleSelect("university")}
              >
                <div className="flex flex-col items-center justify-center">
                  <FaUniversity size={40} className="text-purple-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">University / Company</h3>
                  <p className="text-sm text-gray-300 text-center">
                    Register and verify users through decentralized credentials.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#262638] text-sm text-blue-300 border border-blue-500 rounded-lg text-left">
              <p className="font-semibold text-blue-400 mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300">
                <li>Universities must be verified through admin authorization.</li>
                <li>Users must provide valid details to complete registration.</li>
              </ul>
            </div>
          </div>
        ) : (
          // ----------- REGISTRATION FORM -----------
          <div>
            <h2 className="text-2xl font-bold mb-4 text-center">
              Register as <span className="text-blue-400 capitalize">{role}</span>
            </h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="text"
                placeholder="Your Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-[#2a2a40] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Your Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-[#2a2a40] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <input
                type="email"
                placeholder="Guardian Email 1"
                onChange={(e) => setGuardian1(e.target.value)}
                className="w-full p-3 mt-2"
              />

              <input
                type="email"
                placeholder="Guardian Email 2"
                onChange={(e) => setGuardian2(e.target.value)}
                className="w-full p-3 mt-2" 
              />

              <input
                type="email"
                placeholder="Guardian Email 3"
                onChange={(e) => setGuardian3(e.target.value)}
                className="w-full p-3 mt-2"
              />

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPopup;
