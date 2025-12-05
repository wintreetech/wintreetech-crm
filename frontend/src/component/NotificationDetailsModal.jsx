import { X, CalendarDays, Clock } from "lucide-react";

const NotificationDetailsModal = ({ open, onClose, notification }) => {
  if (!open) return null;

  const {
    title = "Notification Title",
    message = "Notification details go here...",
    date = "October 26, 2023",
    time = "10:15 AM",
  } = notification || {};

  const handleClose = () => onClose?.();

  return (
    <div className="modal modal-open" onClick={handleClose}>
      <div
        className="modal-box relative w-full max-w-3xl bg-white dark:bg-gray-900/90 rounded-xl shadow-lg border border-gray-200/80 dark:border-gray-800 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="btn btn-ghost btn-sm btn-circle absolute top-4 right-4 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-8">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight">
                {title}
              </h2>

              {/* Date + Time */}
              <div className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-gray-400">
                <CalendarDays size={16} />
                <p className="text-sm font-medium">{date}</p>

                <span className="text-gray-300 dark:text-gray-600">·</span>

                <Clock size={16} />
                <p className="text-sm font-medium">{time}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Message */}
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
              {message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailsModal;
