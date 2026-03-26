import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../web3/abi.json";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

  // Auto-fetch wallet address
  useEffect(() => {
    const fetchAccount = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
          setAccount(accounts[0]);
        } catch (err) {
          console.error("Wallet connection rejected");
        }
      } else {
        alert("Please install MetaMask!");
      }
    };
    fetchAccount();
  }, []);

      const handleLogin = async (e) => {
      e.preventDefault();

      try {
        setLoading(true);

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        const [
          userAddress,
          role,
          isRegistered,
          name,
          email
        ] = await contract.getUserDetails(account);

        if (!isRegistered) {
          alert("No account found! Please register.");
          navigate("/");
          return;
        }

        if (Number(role) === 0) {
          navigate("/user-dashboard", {state: { account: userAddress, name }});
        } else {
          navigate("/user-dashboard", {state: { account: userAddress, name }});
        }

      } catch (err) {
        console.error("Login error:", err);
        alert("Login failed");
      } finally {
        setLoading(false);
      }
    };


  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-700 p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4 text-center">Login to Your Account</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            value={account}
            readOnly
            className="w-full p-2 border rounded bg-gray-500 text-white"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
