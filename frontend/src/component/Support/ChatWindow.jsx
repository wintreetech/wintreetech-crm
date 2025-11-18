import React, { useState } from "react";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatWindow({ ticket, onBack }) {
  const [message, setMessage] = useState("");

  if (!ticket)
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted-light text-base sm:text-lg bg-background-light p-4 sm:p-6 text-center">
        <p>← Select a ticket from the list to view the conversation.</p>
      </div>
    );

  const agentAvatar = "https://placehold.co/100x100/059669/ffffff?text=AG";

  const handleSend = () => {
    if (message.trim() === "") return;
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div
      className="flex flex-col h-full bg-background-light"
      // style={{
      //   backgroundImage: `url("/telegram-bg.jpg")`,
      //   backgroundSize: "cover",
      // }}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 border-b border-border-light bg-card-light shadow-sm gap-3">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button (mobile only) */}
          <button
            className="sm:hidden p-2 rounded-full hover:bg-gray-100 text-text-light transition"
            onClick={onBack}
            title="Back to List"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* User info */}
          <div className="flex items-center min-w-0">
            <img
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full mr-2 flex-shrink-0 object-cover"
              src={ticket.avatar}
              alt={ticket.name}
            />
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-lg text-text-light truncate">
                {ticket.name}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted-light truncate">
                Ticket ID: {ticket.id}
              </p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center text-xs sm:text-sm md:text-base flex-wrap sm:flex-nowrap">
          <p className="text-text-muted-light whitespace-nowrap">
            Assigned to:
          </p>
          <span className="bg-blue-100 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm ml-2 font-semibold text-blue-700 rounded-full mt-1 sm:mt-0 truncate max-w-[150px] sm:max-w-none">
            {ticket.name}
          </span>
        </div>
      </div>

      {/* CONVERSATION */}
      <div className="flex-1 p-3 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar">
        {ticket.conversation.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.sender === "Alex" ? "flex-row-reverse" : ""
            } items-start gap-3 sm:gap-4`}
          >
            <img
              src={msg.sender === "Alex" ? agentAvatar : msg.avatar}
              alt={msg.sender}
              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/100x100/CCCCCC/666666?text=User";
              }}
            />
            <div
              className={`max-w-[80%] sm:max-w-xl ${
                msg.sender === "Alex" ? "text-right" : "text-left"
              }`}
            >
              <p
                className={`text-[11px] sm:text-xs font-semibold mb-1 ${
                  msg.sender === "Alex"
                    ? "text-primary"
                    : "text-text-muted-light"
                }`}
              >
                {msg.sender === "Alex" ? "You (Alex Green)" : msg.sender}
              </p>
              <div
                className={`p-2 sm:p-3 rounded-xl shadow-xs break-words ${
                  msg.sender === "Alex"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-card-light border border-border-light rounded-tl-none text-text-light"
                }`}
              >
                {msg.text}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MESSAGE INPUT */}
      <div className="p-3 sm:p-4 border-t border-border-light bg-card-light">
        <div className="flex items-center gap-2 sm:gap-3">
          <textarea
            rows="1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply to customer..."
            className="flex-1 resize-none rounded-lg border border-border-light p-2 sm:p-3 text-sm focus:ring-primary focus:border-primary transition min-h-[42px] sm:min-h-[48px]"
          ></textarea>

          <button
            onClick={handleSend}
            className="flex items-center justify-center h-10 sm:h-11 w-24 sm:w-28 rounded-full bg-blue-500 text-white shadow-md transition duration-150 hover:bg-blue-600 active:scale-95 cursor-pointer"
            title="Send Message"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-sm sm:text-base">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
