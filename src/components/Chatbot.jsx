import { useState } from "react";
import { X, MessageCircle, Send } from "lucide-react";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (input.trim() !== "") {
      setMessages([...messages, { text: input, sender: "user" }]);
      setInput("");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-end">
      {isOpen && (
        <div className="mb-16 bg-white shadow-2xl rounded-2xl p-6 w-96 h-[30rem] flex flex-col relative transition-all duration-300 ease-in-out ring-2 ring-blue-300">
          <div className="flex justify-between items-center border-b pb-3">
            <h2 className="text-xl font-semibold text-black">Chatbot</h2>
          </div>
          <div className="flex-1 p-3 overflow-y-auto text-sm text-gray-700 space-y-2">
            {messages.map((msg, index) => (
              <div key={index} className={`p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-500 text-white self-end" : "bg-gray-200 text-black self-start"}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t pt-3">
            <input
              type="text"
              placeholder="Type a message..."
              className="border rounded-lg p-3 w-full text-sm text-black"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button 
              className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600"
              onClick={sendMessage}
            >
              <Send size={24} />
            </button>
          </div>
        </div>
      )}
      <button
        className="rounded-full p-4 shadow-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>
    </div>
  );
}
