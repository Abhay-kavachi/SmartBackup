import { useState } from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "../types";

type Props = {
  messages: ChatMessage[];
  onSend: (text: string) => Promise<void>;
  powerWarning?: boolean;
};

const ChatbotPanel = ({ messages, onSend, powerWarning }: Props) => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    await onSend(text);
    setText("");
    setLoading(false);
  };

  return (
    <motion.div
      className="bg-[#0f1520] border border-gray-800 rounded-2xl h-full flex flex-col"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
    >
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <p className="font-semibold">Chitty Assistant</p>
        {powerWarning && <span className="text-xs text-yellow-300">Low battery: backups paused</span>}
      </div>
      <div className="flex-1 overflow-auto space-y-4 p-4">
        {messages.map((message) => (
          <div key={message.timestamp} className={`flex ${message.sender === "You" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                message.sender === "You" ? "bg-primary text-white" : "bg-[#161b22] text-gray-100"
              }`}
            >
              <p className="text-xs text-gray-300 mb-1">{message.sender}:</p>
              <p>{message.text}</p>
              {message.meta && (
                <pre className="mt-2 text-[10px] text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(message.meta, null, 2)}
                </pre>
              )}
            </div>
          </div>
        ))}
        {!messages.length && <p className="text-center text-gray-500 text-sm">Ask Chitty for stats or schedules.</p>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a command..."
          className="flex-1 bg-[#161b22] px-3 py-2 rounded-xl border border-gray-700 outline-none focus:ring-2 focus:ring-primary"
        />
        <button className="bg-primary px-4 py-2 rounded-xl text-white font-semibold disabled:opacity-40" disabled={loading}>
          Send
        </button>
      </form>
    </motion.div>
  );
};

export default ChatbotPanel;

