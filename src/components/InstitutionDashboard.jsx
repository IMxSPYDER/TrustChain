import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import DecentralizedIdentityABI from "../web3/abi.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

const InstitutionDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [credentials, setCredentials] = useState([]);
  const [requested, setRequested] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    if (!window.ethereum) return alert("Connect Wallet");

    setLoading(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      contractAddress,
      DecentralizedIdentityABI,
      signer
    );

    const latestBlock = await provider.getBlockNumber();
    const event = contract.interface.getEvent("UserRegistered");
    const topic = event.topicHash;

    const STEP = 1000;
    const fetchedUsers = [];
    const seen = new Set();

    const DEPLOYMENT_BLOCK = 37736688; 

    // 🔥 START FROM DEPLOYMENT BLOCK
    for (let from = DEPLOYMENT_BLOCK; from <= latestBlock; from += STEP) {
      const to = Math.min(from + STEP, latestBlock);

      const logs = await provider.getLogs({
        address: contractAddress,
        fromBlock: from,
        toBlock: to,
        topics: [topic],
      });

      for (const log of logs) {
        const parsed = contract.interface.parseLog(log);

        // ✅ FIXED
        const userAddress = parsed.args[0];
        if (!userAddress || seen.has(userAddress)) continue;

        seen.add(userAddress);

        const data = await contract.getUserDetails(userAddress);

        if (Number(data[2]) !== 0) continue; // only USER

        fetchedUsers.push({
          address: userAddress,
          name: data[0],
          email: data[1],
        });
      }
    }

    setUsers(fetchedUsers);
  } catch (err) {
    console.error("Error fetching users:", err);
    setError("Failed to load users");
  } finally {
    setLoading(false);
  }
};



const openModal = async (user) => {
  try {
    if (!window.ethereum) return alert("Connect Wallet");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      contractAddress,
      DecentralizedIdentityABI,
      signer
    );

    // ✅ FIXED FUNCTION NAMES
    const creds = await contract.getUserCredentialsByAddress(user.address);
    const requests = await contract.getAccessRequestsByUser(user.address);

    const requestMap = {};
    for (const req of requests) {
      if (req.requester.toLowerCase() === signer.address.toLowerCase()) {
        requestMap[req.credentialHash] = req.isApproved;
      }
    }

    setRequested(requestMap);

    setCredentials(
      creds.map((cred) => ({
        name: cred.name,
        certificateName: cred.certificateName,
        hash: cred.documentIPFSHash,
        isVerified: cred.isVerified,
        isRevoked: cred.isRevoked,
      }))
    );

    setSelectedUser(user);
    setShowModal(true);
  } catch (err) {
    console.error("Error loading credentials:", err);
    alert("Failed to load credentials");
  }
};



  const requestDocument = async (hash) => {
    try {
      if (!window.ethereum) return alert("Connect Wallet");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        DecentralizedIdentityABI,
        signer
      );

      const tx = await contract.requestCredential(selectedUser.address, hash);
      await tx.wait();

      setRequested((prev) => ({
        ...prev,
        [hash]: false, // pending approval
      }));

      alert("Access request sent");
    } catch (err) {
      console.error("Error requesting:", err);
      alert("Request failed");
    }
  };

  return (
    <div className="p-8 grid gap-6">
      <h1 className="text-3xl font-bold">Institution Dashboard</h1>

      <input
        type="text"
        placeholder="Search User"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md p-2 border border-gray-300 rounded"
      />

      {loading && <p>Loading users...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="min-w-full border border-gray-300 rounded-2xl overflow-hidden shadow-lg">
        <thead className="bg-blue-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users
            .filter(
              (u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
            )
            .map((user, i) => (
              <tr
                key={i}
                className="hover:bg-blue-50 cursor-pointer transition duration-150 ease-in-out"
                onClick={() => openModal(user)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {user.email}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-midnight p-6 rounded-lg w-full max-w-md relative">
            <h2 className="text-xl font-semibold mb-4">
              {selectedUser.name}'s Credentials
            </h2>
            <button
              className="absolute top-2 right-2 text-gray-700 cursor-pointer"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <ul className="space-y-3">
              {credentials.length === 0 && <p>No credentials found</p>}
              {credentials.map((cred, i) => (
                <li
                  key={i}
                  className="flex justify-between items-center bg-gray-700 p-2 rounded"
                >
                  <div>
                    <p className="font-medium">{cred.certificateName}</p>
                    {cred.isVerified && (
                      <p className="text-green-600 text-xs">Verified</p>
                    )}
                    {cred.isRevoked && (
                      <p className="text-red-600 text-xs">Revoked</p>
                    )}
                  </div>
                  <div>
                    {requested[cred.hash] === undefined ? (
                      <button
                        onClick={() => requestDocument(cred.hash)}
                        className="bg-blue-500 text-white px-2 py-1 rounded cursor-pointer"
                      >
                        Request
                      </button>
                    ) : requested[cred.hash] ? (
                      <p className="text-green-600 text-xs">Access Granted</p>
                    ) : (
                      <p className="text-yellow-600 text-xs">Requested</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Display Age Verification */}
            {/* {selectedUser.ageVerified ? (
              <p className="mt-4 text-green-600">Age Verified: 18+</p>
            ) : (
              <p className="mt-4 text-red-600">Age Verification Pending</p>
            )} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstitutionDashboard;