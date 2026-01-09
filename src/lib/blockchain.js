import { ethers } from "ethers"
import DecentralizedIdentity from "../web3/abi.json" // ABI File

const CONTRACT_ADDRESS = "0x6f2eEf81Db6955FDb6e8DFfA741e33924190b3cD"

let provider, signer, contract

export const connectWallet = async () => {
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])
      signer = await provider.getSigner() // ✅ Await here
      contract = new ethers.Contract(CONTRACT_ADDRESS, DecentralizedIdentity, signer)
      const address = await signer.getAddress() // ✅ No error now
      return address
    } else {
      throw new Error("MetaMask not found")
    }
  }
  

export const getUserDID = async () => {
  const address = await connectWallet()
  const isRegistered = await contract.isUserRegistered(address)

  if (isRegistered) {
    const [name, email, role] = await contract.getUserDetails(address)
    return {
      did: `did:blockid:${address}`,
      name,
      email,
      role,
    }
  } else {
    return {
      did: `did:blockid:${address}`,
      name: "Unregistered User",
      email: "",
      role: "N/A",
    }
  }
}

export const getUserCredentials = async () => {
  const address = await connectWallet()
  const credentials = await contract.getUserCredentials()

  return credentials.map((c, index) => ({
    id: index,
    title: c.certificateName,
    issuer: c.name,
    date: c.dob,
    certificateId: c.certificateId,
    ipfsHash: c.documentIPFSHash,
    verified: c.isVerified,
  }))
}

export const getCredentialRequests = async () => {
  const address = await connectWallet()
  const requests = await contract.getAccessRequests()

  return requests.map((r, index) => ({
    id: index,
    requester: r.requester,
    credentialHash: r.credentialHash,
    approved: r.isApproved,
  }))
}

export const registerUser = async (name, email, role) => {
  await connectWallet()
  const tx = await contract.registerUser(name, email, role)
  await tx.wait()
}

export const addCredential = async (credential) => {
  await connectWallet()
  const tx = await contract.addCredential(
    credential.name,
    credential.certificateId,
    credential.dob,
    credential.certificateName,
    credential.age,
    credential.documentIPFSHash
  )
  await tx.wait()
}

export const approveAccess = async (requester, credentialHash) => {
  await connectWallet()
  const tx = await contract.grantAccess(requester, credentialHash, true)
  await tx.wait()
}

export const revokeAccess = async (requester, credentialHash) => {
  await connectWallet()
  const tx = await contract.revokeAccess(requester, credentialHash)
  await tx.wait()
}
