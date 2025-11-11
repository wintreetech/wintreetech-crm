// src/component/Support/TicketList.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Users, Search, X, MessageCircle, Clock, Ticket } from "lucide-react";
import { MOCK_TICKETS, MOCK_GROUPS } from "../../data/tickets";

export default function TicketList({
  tickets = MOCK_TICKETS,
  groups = MOCK_GROUPS,
  onSelect = () => {},
  selectedItem = null, // CHANGED: generic selected item (ticket or group)
}) {
  const [activeTab, setActiveTab] = useState("tickets");
  const [searchQuery, setSearchQuery] = useState("");

  const isTicketView = activeTab === "tickets";
  const currentList = isTicketView ? tickets : groups;

  // Auto-select first item for the active tab if nothing is selected yet
  useEffect(() => {
    if (!selectedItem && currentList.length > 0) {
      onSelect(currentList[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const filteredList = useMemo(() => {
    if (!searchQuery) return currentList;
    const query = searchQuery.toLowerCase();
    return currentList.filter((item) => {
      const nameMatch = item.name?.toLowerCase().includes(query);
      const msgMatch = item.message?.toLowerCase().includes(query);
      return nameMatch || msgMatch;
    });
  }, [currentList, searchQuery]);

  const getStatusBadge = (status) => {
    if (!status) return null;
    const style =
      status === "High"
        ? "bg-red-100 text-red-700"
        : status === "Medium"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700";
    return (
      <span
        className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ml-2 ${style}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border-r border-gray-200 shrink-0">
      <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            className={`flex-1 py-2 text-sm font-semibold transition rounded-t-lg flex justify-center items-center gap-1 ${
              !isTicketView
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => {
              setActiveTab("groups");
              setSearchQuery("");
            }}
          >
            <Users size={16} /> Groups
          </button>
          <button
            className={`flex-1 py-2 text-sm font-semibold transition rounded-t-lg flex justify-center items-center gap-1 ${
              isTicketView
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            onClick={() => {
              setActiveTab("tickets");
              setSearchQuery("");
            }}
          >
            <Ticket size={16} /> Tickets
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            placeholder={`Search ${isTicketView ? "tickets" : "groups"}...`}
            className="w-full rounded-xl border border-gray-300 pr-10 pl-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          ) : (
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredList.length > 0 ? (
          filteredList.map((item, i) => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-4 p-4 border-b border-gray-100 transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-100/60 border-l-4 border-l-blue-500"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => onSelect(item)}
              >
                {isTicketView ? (
                  <Ticket className="text-blue-500" />
                ) : (
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="h-10 w-10 rounded-full object-cover border border-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold text-gray-900 truncate text-sm">
                      {item.name}
                    </p>
                    {/* Tickets show status; groups show members */}
                    {"status" in item ? (
                      getStatusBadge(item.status)
                    ) : (
                      <span className="flex items-center text-xs font-medium whitespace-nowrap ml-2 text-gray-500 py-0.5 px-2 bg-gray-100 rounded-full">
                        <Users size={12} className="mr-1" /> {item.members}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {item.message}
                  </p>
                  <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-6 text-center text-gray-500 text-sm">
            No {isTicketView ? "tickets" : "groups"} found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
