// MemberCard.jsx
import React from "react";

const MemberCard = ({
  userId,
  name,
  email,
  role,
  roleColor,
  initials,
  createdAt,
  selectable = false,
  checked = false,
  onToggle,
}) => {
  const roleColorClasses =
    roleColor === "purple"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-200"
      : roleColor === "green"
      ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200"
      : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200";

  return (
    <div
      className={`
        group relative flex flex-col gap-2 sm:gap-3 rounded-lg sm:rounded-xl border
        border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
        p-3 sm:p-4 text-center shadow-sm transition-all hover:shadow-lg w-full
        ${selectable ? "cursor-pointer" : ""}
        ${checked ? "ring-2 ring-primary/60" : ""}
      `}
      onClick={() => selectable && onToggle?.()}
      role="button"
    >
      {/* ✅ Checkbox (only visible when workspace selected) */}
      {selectable && (
        <label
          className="absolute top-3 left-3 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            checked={checked}
            onChange={onToggle}
          />
        </label>
      )}

      {/* Avatar */}
      <div className="mx-auto mt-1 sm:mt-2">
        <div
          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-base sm:text-2xl font-semibold text-gray-700 dark:text-gray-100"
          aria-label={`${name}'s initials`}
        >
          {initials}
        </div>
      </div>

      {/* Text info */}
      <div className="flex flex-col">
        <p className="text-gray-900 dark:text-gray-100 text-sm sm:text-base font-medium leading-normal break-words">
          {name}
        </p>

        <div className="mt-2 flex flex-col items-center gap-1">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${roleColorClasses}`}
          >
            {role}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
