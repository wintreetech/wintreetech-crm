import { useMemo, useState } from "react";
import {
  AtSign,
  UserCheck,
  CalendarClock,
  MessageSquareText,
  PlugZap,
} from "lucide-react";
import NotificationDetailsModal from "../component/NotificationDetailsModal";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");

  // ✅ modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const notifications = useMemo(
    () => [
      {
        id: 1,
        unread: true,
        type: "mention",
        titleText: "John Doe mentioned you in 'Q4 Report'", // ✅ for modal
        title: (
          <>
            <span className="font-bold">John Doe</span> mentioned you in{" "}
            <span className="font-bold">'Q4 Report'</span>
          </>
        ),
        message:
          "“Hey, can you take a look at the latest figures? I've updated the spreadsheet.”",
        time: "5m ago",
        date: "October 26, 2023",
        clock: "10:15 AM",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuByjk6_3UhRSt-HcqLeDvR9slqv9puPukDSXaOl4jbaPT4s8Aef-Ut2UrZ_0VpHH-Em5zrNIMm0o-iRbmTuOiuHl5dZ8seEZHfS7GLDpjaVhHR_mdgf1UFAMNjFesSOz3KYeG1kqbaOFQDbRsL4MXISm5CxJ2mJBE4_izti680xDIuwOyyxn7pOOJz0eCUkwQT62quOd2grL10AyD_-kaeOATOZANHles0E_2NHwrq4fOPxoYk3VGHOn7oXuRMMsUwmb7uk25Pa1d4",
      },
      {
        id: 2,
        unread: true,
        type: "assigned",
        titleText:
          "You were assigned to 'Finalize Marketing Deck' by Jane Smith",
        title: (
          <>
            You were assigned to{" "}
            <span className="font-bold">'Finalize Marketing Deck'</span> by Jane
            Smith
          </>
        ),
        message: "Please complete by EOD Friday.",
        time: "1h ago",
        date: "October 25, 2023",
        clock: "2:00 PM",
      },
      {
        id: 3,
        unread: false,
        type: "due",
        titleText: "The task 'Submit Expense Report' is due tomorrow",
        title: (
          <>
            The task <span className="font-bold">'Submit Expense Report'</span>{" "}
            is due tomorrow
          </>
        ),
        message: "Don't forget to attach all receipts.",
        time: "12h ago",
        date: "October 24, 2023",
        clock: "6:00 PM",
      },
      {
        id: 4,
        unread: false,
        type: "comment",
        titleText: "Alex Johnson commented on 'Website Redesign Mockups'",
        title: (
          <>
            <span className="font-bold">Alex Johnson</span> commented on{" "}
            <span className="font-bold">'Website Redesign Mockups'</span>
          </>
        ),
        message: "“Great progress! I've left some feedback on the Figma file.”",
        time: "Yesterday",
        date: "October 23, 2023",
        clock: "11:20 AM",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAK637yNoGAvaCL5klHYAhPd4Y82VTpmolAlMDD38uT1JJHv2OuMfovX4bRCNVe5u_GZTNUznR7g-YmdFR2QvsbgTo2WR-x7iKtbv4VqKqqjKvJ9Zbfc_BLzWra_qT8DVusRIdJPiI72XKcgGjA7nYQ68ixZ5MXGCqBDJZKX-E1--NMRW6exixFF6DSc8hPZFSO0R4O6Giv2IYCl3e5977VKbWdI-vLAARrkJX8BJ0ffsEL1gk9oS_-TJFmpFK-7dwFBrnGnqRNHyE",
      },
      {
        id: 5,
        unread: false,
        type: "integration",
        titleText: "A new integration for Slack is now available",
        title: (
          <>
            A new integration for <span className="font-bold">Slack</span> is
            now available
          </>
        ),
        message: "Connect your workspace to receive real-time updates.",
        time: "2 days ago",
        date: "October 22, 2023",
        clock: "9:10 AM",
      },
    ],
    []
  );

  const filtered = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => n.unread);
    if (activeTab === "mentions")
      return notifications.filter((n) => n.type === "mention");
    return notifications;
  }, [notifications, activeTab]);

  const getIcon = (n) => {
    switch (n.type) {
      case "mention":
        return (
          <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-10 w-10">
            <AtSign size={18} />
          </div>
        );
      case "assigned":
        return (
          <div className="flex items-center justify-center bg-green-500/10 text-green-600 rounded-full h-10 w-10">
            <UserCheck size={18} />
          </div>
        );
      case "due":
        return (
          <div className="flex items-center justify-center bg-red-500/10 text-red-600 rounded-full h-10 w-10">
            <CalendarClock size={18} />
          </div>
        );
      case "comment":
        return (
          <div className="flex items-center justify-center bg-slate-500/10 text-slate-600 rounded-full h-10 w-10">
            <MessageSquareText size={18} />
          </div>
        );
      case "integration":
        return (
          <div className="flex items-center justify-center bg-indigo-500/10 text-indigo-600 rounded-full h-10 w-10">
            <PlugZap size={18} />
          </div>
        );
      default:
        return null;
    }
  };

  // ✅ open modal with selected notification
  const openDetails = (notif) => {
    setSelectedNotification(notif);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedNotification(null);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content p-4 sm:p-6 lg:p-8">
      <div>
        {/* Heading */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h1 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white">
            Notifications
          </h1>
        </div>

        {/* Tabs */}
        <div className="tabs mb-4">
          <button
            className={`tab font-bold hover:text-gray-700 ${
              activeTab === "all"
                ? "tab-active text-gray-500 bg-gray-200 rounded-lg"
                : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`tab font-bold hover:text-gray-700 ${
              activeTab === "unread"
                ? "tab-active text-gray-500 bg-gray-200 rounded-lg"
                : ""
            }`}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </button>
          <button
            className={`tab font-bold hover:text-gray-700 ${
              activeTab === "mentions"
                ? "tab-active text-gray-500 bg-gray-200 rounded-lg"
                : ""
            }`}
            onClick={() => setActiveTab("mentions")}
          >
            Mentions
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-2">
          {filtered.map((n) => (
            <button
              key={n.id}
              onClick={() => openDetails(n)}
              className={`group flex items-center gap-4 p-4 rounded-xl transition text-left
                ${
                  n.unread
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "bg-base-100 hover:bg-base-200"
                }`}
            >
              {/* unread dot */}
              {n.unread && (
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-primary" />
              )}

              {/* avatar or icon */}
              {n.avatar ? (
                <img
                  src={n.avatar}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                getIcon(n)
              )}

              {/* content */}
              <div className="flex-grow min-w-0">
                <p
                  className={`text-base leading-normal ${
                    n.unread ? "font-bold" : "font-medium"
                  }`}
                >
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1">
                  {n.message}
                </p>
              </div>

              {/* time */}
              <p className="text-sm text-gray-500 shrink-0 ml-4 hidden md:block">
                {n.time}
              </p>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-500">
              No notifications here.
            </div>
          )}
        </div>
      </div>

      {/* ✅ Notification Details Modal */}
      <NotificationDetailsModal
        open={detailsOpen}
        onClose={closeDetails}
        notification={
          selectedNotification && {
            title: selectedNotification.titleText,
            message: selectedNotification.message,
            date: selectedNotification.date,
            time: selectedNotification.clock,
          }
        }
      />
    </div>
  );
};

export default Notifications;
