import { useState } from "react";

export default function ForgotWallet() {
  const [newWallet, setNewWallet] = useState("");

  const submitRecovery = async () => {
    await fetch("http://localhost:5000/api/recovery/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldWallet: window.ethereum.selectedAddress,
        newWallet,
        guardianEmails: [
          "guardian1@mail.com",
          "guardian2@mail.com"
        ]
      })
    });

    alert("Recovery request sent to guardians");
  };

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Recover Account</h3>
      <input
        placeholder="New Wallet Address"
        onChange={e => setNewWallet(e.target.value)}
      />
      <button onClick={submitRecovery}>
        Request Recovery
      </button>
    </div>
  );
}
