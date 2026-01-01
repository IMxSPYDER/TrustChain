import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import contractABI from "../web3/abi.json";

const LoginPage = () => {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const contractAddress = "0x5420bEE9c824253D2b12ae95f26E79197D2c1Df1";

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
    if (!account) {
      alert("Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const isRegistered = await contract.isUserRegistered(account);
      if (!isRegistered) {
        alert("No account found! Please register first.");
        navigate("/"); // Redirect to registration
        return;
      }

      // Get user details
      const [name, email, roleBigInt] = await contract.getUserDetails(account);
      const role = Number(roleBigInt);

      // Redirect based on role
      if (role === 0) {
        navigate("/user-dashboard", { state: { account, contractAddress, name } });
      } else if (role === 1) {
        navigate("/university-dashboard", { state: { account, contractAddress, name } });
      } else {
        alert("Unknown role detected.");
      }

    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
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
