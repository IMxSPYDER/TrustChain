import { keccak256, toUtf8Bytes } from "ethers";

// random secret (never sent to blockchain)
export function generateNonce() {
  return Math.floor(Math.random() * 1e16).toString();
}

// commitment = keccak256(ipfsHash + nonce)
export function generateCommitment(ipfsHash, nonce) {
  return keccak256(toUtf8Bytes(ipfsHash + nonce));
}

// response = keccak256(challenge + nonce)
export function generateResponse(challenge, nonce) {
  return keccak256(toUtf8Bytes(challenge + nonce));
}
