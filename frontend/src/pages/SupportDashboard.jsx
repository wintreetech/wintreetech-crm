import { useEffect, useState } from "react";
import TicketList from "../component/Support/TicketList.jsx";
import ChatWindow from "../component/Support/ChatWindow";
import { MOCK_TICKETS, MOCK_GROUPS } from "../data/tickets";
import { Menu, X } from "lucide-react";
import { Outlet } from "react-router";

function SupportDashboard() {
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (MOCK_TICKETS && MOCK_TICKETS.length > 0 && window.innerWidth >= 768) {
      setSelectedItem(MOCK_TICKETS[0]);
    }
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedItem(ticket);
  };

  const handleBackToList = () => setSelectedItem(null);

  const showListOnly = selectedItem === null;

  return (
    <div className="h-full flex flex-col bg-background-light text-text-light font-display">
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 overflow-hidden">
          <div
            className={`h-full flex flex-col border-r border-border-light shrink-0 overflow-hidden md:w-80 md:relative md:block ${
              selectedItem ? "hidden" : "w-full relative block"
            }`}
          >
            <TicketList
              tickets={MOCK_TICKETS}
              groups={MOCK_GROUPS}
              onSelect={handleSelectTicket}
              selectedItem={selectedItem}
            />
          </div>

          <div className={`flex-1 h-full min-w-0 md:block w-full block`}>
            <ChatWindow ticket={selectedItem} onBack={handleBackToList} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;
