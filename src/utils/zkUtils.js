import { keccak256, toUtf8Bytes } from "ethers";

// random secret (never sent to blockchain)
export function generateNonce() {
  return Math.floor(Math.random() * 1e16).toString();
}

// commitment = hash(ipfsHash + nonce)
export function generateCommitment(ipfsHash, nonce) {
  return hashMessage(toUtf8Bytes(ipfsHash + nonce));
}

// response = hash(challenge + nonce)
export function generateResponse(challenge, nonce) {
  return hashMessage(toUtf8Bytes(challenge + nonce));
}
z
