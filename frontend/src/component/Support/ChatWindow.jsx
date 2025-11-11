import React, { useState } from "react";
import { ArrowLeft, Send, Ticket } from "lucide-react";

export default function ChatWindow({ ticket, onBack }) {
  const [message, setMessage] = useState("");

  if (!ticket)
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted-light text-lg bg-background-light p-6">
        <p>← Select a ticket from the list to view the conversation.</p>
      </div>
    );

  const agentAvatar = "https://placehold.co/100x100/059669/ffffff?text=AG";

  const handleSend = () => {
    if (message.trim() === "") return;
    console.log("Message sent:", message);
    // TODO: Hook up to socket.io or API call here
    setMessage("");
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-light bg-card-light shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100 text-text-light transition"
            onClick={onBack}
            title="Back to List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-lg text-text-light">{ticket.name}</h3>
            <p className="text-sm text-text-muted-light">
              Ticket ID: {ticket.id}
            </p>
          </div>
        </div>
        <div className="flex">
          <p>Assigned to:</p>
          <span className="bg-blue-100 px-3 py-1 text-xs ml-2 font-semibold text-blue-700 rounded-full">
            {ticket.name}
          </span>
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
        {ticket.conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "Alex" ? "flex-row-reverse" : ""
            } items-start gap-3`}
          >
            <img
              src={msg.sender === "Alex" ? agentAvatar : msg.avatar}
              alt={msg.sender}
              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/CCCCCC/666666?text=User";
              }}
            />
            <div
              className={`max-w-xl ${
                msg.sender === "Alex" ? "text-right" : "text-left"
              }`}
            >
              <p
                className={`text-xs font-semibold mb-1 ${
                  msg.sender === "Alex"
                    ? "text-primary"
                    : "text-text-muted-light"
                }`}
              >
                {msg.sender === "Alex" ? "You (Alex Green)" : msg.sender}
              </p>
              <div
                className={`
                  ${
                    msg.sender === "Alex"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-card-light border border-border-light rounded-tl-none text-text-light"
                  }
                  rounded-xl p-3 shadow-xs
                `}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-border-light bg-card-light">
        <div className="flex items-center gap-3">
          <textarea
            rows="1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply to customer..."
            className="flex-1 resize-none rounded-lg border border-border-light p-3 text-sm focus:ring-primary focus:border-primary transition"
          ></textarea>
          <button
            onClick={handleSend}
            className="flex items-center justify-center h-10 w-24 rounded-full bg-blue-500 text-white shadow-md transition duration-150 hover:bg-blue-600 active:scale-95 cursor-pointer"
            title="Send Message"
          >
            <Send className="w-5 h-5 mr-2" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
