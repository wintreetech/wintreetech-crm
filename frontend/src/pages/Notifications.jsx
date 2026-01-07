import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux"; // Added Redux hooks
import {
  AtSign,
  UserCheck,
  CalendarClock,
  MessageSquareText,
  PlugZap,
} from "lucide-react";
import NotificationDetailsModal from "../component/NotificationDetailsModal";

// Import Socket instance and init function
import { socket } from "../socket/index.js"; // Adjust this path to where your socket is initialized
import { initNotificationSocket } from "../socket/notification.socket.jsx";

// Import Redux actions
import {
  fetchNotifications,
  markAsRead,
} from "../store/slices/Notification.slice.js";
import { selectCurrentUser } from "../store/slices/Auth.slice.js";

const Notifications = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("all");

  // Get real data from Redux
  const notificationState = useSelector((state) => state.notifications) || {
    items: [],
    loading: false,
  };
  const { items: reduxNotifications, loading } = notificationState;

  // Get user ID for the fetch call
  const user = useSelector(selectCurrentUser);
  const userId = user?.id;

  // ✅ modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // ✅ 1. Initial Fetch
  useEffect(() => {
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [userId, dispatch]);

  // ✅ NEW: Real-time Socket Listener for Browser Notifications
  useEffect(() => {
    if (socket && userId) {
      const cleanup = initNotificationSocket(socket, userId, dispatch);
      return () => {
        if (cleanup) cleanup();
      };
    }
  }, [socket, userId, dispatch]);

  // ✅ 2. Filter Logic (Using Redux data)
  const filtered = useMemo(() => {
    const list = Array.isArray(reduxNotifications) ? reduxNotifications : [];
    if (activeTab === "unread") return list.filter((n) => !n.isRead);
    if (activeTab === "mentions")
      return list.filter((n) => n.type === "MENTION");
    return list;
  }, [reduxNotifications, activeTab]);

  const getIcon = (n) => {
    // Standardizing the type check to match backend strings
    const type = n.type?.toUpperCase();
    switch (type) {
      case "MENTION":
        return (
          <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full h-10 w-10">
            <AtSign size={18} />
          </div>
        );
      case "ASSIGNED":
        return (
          <div className="flex items-center justify-center bg-green-500/10 text-green-600 rounded-full h-10 w-10">
            <UserCheck size={18} />
          </div>
        );
      case "DUE":
        return (
          <div className="flex items-center justify-center bg-red-500/10 text-red-600 rounded-full h-10 w-10">
            <CalendarClock size={18} />
          </div>
        );
      case "COMMENT":
        return (
          <div className="flex items-center justify-center bg-slate-500/10 text-slate-600 rounded-full h-10 w-10">
            <MessageSquareText size={18} />
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center bg-indigo-500/10 text-indigo-600 rounded-full h-10 w-10">
            <PlugZap size={18} />
          </div>
        );
    }
  };

  // ✅ open modal and mark as read
  const openDetails = (notif) => {
    setSelectedNotification(notif);
    setDetailsOpen(true);

    // Mark as read in DB/Redux if it's currently unread
    if (!notif.isRead) {
      dispatch(markAsRead({ userId, notificationId: notif._id }));
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedNotification(null);
  };

  if (loading && reduxNotifications.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 text-base-content p-4 sm:p-6 lg:p-8">
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
                ? "tab-active text-gray-700 bg-gray-200 rounded-lg"
                : ""
            }`}
            onClick={() => setActiveTab("all")}
          >
            All
          </button>
          <button
            className={`tab font-bold hover:text-gray-700 ${
              activeTab === "unread"
                ? "tab-active text-gray-700 bg-gray-200 rounded-lg"
                : ""
            }`}
            onClick={() => setActiveTab("unread")}
          >
            Unread
          </button>
          <button
            className={`tab font-bold hover:text-gray-700 ${
              activeTab === "mentions"
                ? "tab-active text-gray-700 bg-gray-200 rounded-lg"
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
              key={n._id}
              onClick={() => openDetails(n)}
              className={`group flex items-center gap-4 p-4 rounded-xl transition text-left cursor-pointer
                ${
                  !n.isRead
                    ? "bg-primary/10 hover:bg-primary/15"
                    : "bg-base-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
            >
              {/* unread dot */}
              {!n.isRead && (
                <div className="w-2 h-2 rounded-full flex-shrink-0 bg-primary" />
              )}

              {/* avatar or icon */}
              {n.senderAvatar ? (
                <img
                  src={n.senderAvatar}
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
                    !n.isRead ? "font-bold" : "font-medium"
                  }`}
                >
                  {n.title}
                </p>
                <p className="text-sm text-gray-500 line-clamp-1 dark:text-gray-400">
                  {n.message}
                </p>
              </div>

              {/* time */}
              <p className="text-sm text-gray-500 shrink-0 ml-4 hidden md:block">
                {new Date(n.createdAt).toLocaleDateString()}
              </p>
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-6 text-xl text-center text-gray-500">
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
            title: selectedNotification.title,
            message: selectedNotification.message,
            createdAt: selectedNotification.createdAt,
            senderName: selectedNotification.senderName,
            type: selectedNotification.type,
          }
        }
      />
    </div>
  );
};

export default Notifications;
