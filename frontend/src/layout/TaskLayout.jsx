import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  X,
  Undo2,
  BookCheck,
  UserPen,
  MonitorCog,
  ClipboardPlus,
  ChartPie,
  Bell,
  ChevronRight,
  ChevronLeft,
  TextAlignJustify,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, selectCurrentUser } from "../store/slices/Auth.slice.js";
import { fetchUsers } from "../store/slices/Users.slice.js";
import { socket } from "../socket/index.js";
import { initNotificationSocket } from "../socket/notification.socket.jsx";
import { fetchNotifications } from "../store/slices/Notification.slice.js";
import { useSidebarCollapse } from "../hooks/useSidebarCollapse.js";
import { fetchWorkspaces } from "../store/slices/Workspaces.slice.js";
import { initNotifications } from "../utils/notificationManager.js";

function TaskLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  //   const saved = localStorage.getItem("taskSidebarCollapsed");
  //   return saved === "true";
  // });

  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();

  const [showLabels, setShowLabels] = useState(!sidebarCollapsed);
  const expandTimerRef = useRef(null);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id;

  // ✅ Get unreadCount directly from your notifications slice state
  const unreadCount =
    useSelector((state) => state.notifications.unreadCount) || 0;

  const showSidebar =
    currentUser?.role === "superadmin" ||
    currentUser?.role === "admin" ||
    currentUser?.role === "user";

  const toggleSection = (value) => {
    navigate(`/${value}`);
    setSidebarOpen(false);
  };

  const handleLogoutClick = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logout successful");
    } catch (e) {
      toast.error(
        typeof e === "string" ? e : "Logout failed (cleared locally)",
      );
    } finally {
      navigate("/login");
    }
  };

  const formatTitle = (path, user) => {
    if (path === "/") return "Home Dashboard";
    const segments = path
      .split("/")
      .filter(Boolean)
      .map((s) => s.toLowerCase());
    if (segments.includes("workspaces")) return "Workspaces Dashboard";
    const last = segments[segments.length - 1];
    if (last === "dashboard" && user?.role === "superadmin")
      return "Management Dashboard";
    return last.charAt(0).toUpperCase() + last.slice(1) + " Dashboard";
  };

  // ✅ 1. BROWSER PERMISSION REQUEST
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // ✅ 2. FETCH USERS & INITIAL NOTIFICATIONS
  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch((err) => {
        toast.error(err || "Failed to fetch users");
      });

    // Fetch notifications for the count when userId is available
    if (userId) {
      dispatch(fetchNotifications(userId));
    }
  }, [dispatch, userId]);

  // ✅ 3. GLOBAL NOTIFICATION SOCKET & MANAGER INITIALIZATION
  useEffect(() => {
    let cleanupFn;

    if (socket && userId) {
      // Initialize Socket for real-time UI updates
      cleanupFn = initNotificationSocket(socket, userId, dispatch);

      // For mobile notifications notificationsManger.js registration & Desktop status sync
      initNotifications(userId);
    }

    return () => {
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
    };
  }, [socket, userId, dispatch]);

  // ✅ 4. FETCH WORKSPACES
  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchWorkspaces(currentUser.id));
    }
  }, [dispatch, currentUser?.id]);

  const pageTitle = formatTitle(location.pathname, currentUser);

  const sidebarItems = [
    {
      name: "Analytics",
      icon: <ChartPie size={18} />,
      path: "tasks/analytics",
      roles: ["superadmin"],
    },
    {
      name: "My Tasks",
      icon: <UserPen size={18} />,
      path: "tasks/mytasks",
      roles: ["superadmin", "admin", "user"],
    },
    {
      name: "Workspaces",
      icon: <MonitorCog size={18} />,
      path: "tasks/workspaces",
      roles: ["superadmin", "admin", "user"],
    },
    {
      name: "Team Members",
      icon: <Users size={18} />,
      path: "tasks/members",
      roles: ["superadmin", "admin"],
    },
  ];

  const allowedSidebarItems = sidebarItems.filter((item) => {
    if (!currentUser) return false;
    if (!item.roles.includes(currentUser.role)) return false;
    return true;
  });

  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    if (!sidebarCollapsed) {
      expandTimerRef.current = setTimeout(() => setShowLabels(true), 100);
    } else {
      setShowLabels(false);
    }
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, [sidebarCollapsed]);

  return (
    <div className="h-screen flex flex-col">
      <header className="flex flex-wrap md:flex-nowrap justify-between items-center bg-gray-900 text-white px-3 md:px-4 py-2 shadow-md gap-2">
        {showSidebar && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-50/20"
            aria-label="Open sidebar menu"
            title="Menu"
          >
            <TextAlignJustify />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-xl font-semibold leading-tight truncate">
            {pageTitle}
          </h1>
          <p className="text-gray-400 text-xs truncate">
            (
            {currentUser?.department?.charAt(0).toUpperCase() +
              currentUser?.department?.slice(1)}
            )
          </p>
        </div>

        <div className="relative shrink-0">
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* ✅ Bell Icon with Unread Count Badge */}
            <button
              onClick={() => navigate("/tasks/notifications")}
              className="hover:bg-gray-50/20 p-2 rounded-lg relative"
            >
              <Bell />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-gray-900 shadow-sm">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <div className="hidden sm:flex flex-col justify-end items-end">
              <p className="text-sm md:text-lg font-semibold text-white capitalize">
                hi, {currentUser?.username?.split(" ")[0]}
              </p>
              <p className="text-xs md:text-sm text-gray-300">
                {currentUser?.role}
              </p>
            </div>

            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="bg-white text-black w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold shadow-lg transition"
            >
              {currentUser?.username?.charAt(0).toUpperCase()}
            </button>
          </div>

          {avatarOpen && (
            <ul className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl p-2 z-50 text-sm border border-gray-200">
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {showSidebar && (
          <aside
            className={`fixed md:static top-0 left-0 h-full bg-gray-900 text-white p-4 transition-all duration-300 ease-in-out z-40 flex flex-col justify-between ${
              sidebarCollapsed ? "w-20" : "w-64"
            } ${
              sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full md:translate-x-0"
            }`}
          >
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="text-xl font-bold">Menu</h2>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <ul className="space-y-2">
              {allowedSidebarItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={`/${item.path}`}
                    onClick={() => toggleSection(item.path)}
                    className={({ isActive }) =>
                      [
                        "flex items-center w-full px-3 py-2 rounded-lg transition gap-2",
                        "hover:bg-gray-800 focus:outline-none",
                        isActive ? "bg-gray-800 text-white" : "text-gray-300",
                        sidebarCollapsed ? "justify-center" : "",
                      ].join(" ")
                    }
                    aria-current={({ isActive }) =>
                      isActive ? "page" : undefined
                    }
                    title={item.name}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span
                      className={`ml-2 transition-opacity duration-200 whitespace-nowrap ${
                        showLabels ? "opacity-100" : "opacity-0"
                      } ${sidebarCollapsed ? "hidden" : "block"}`}
                    >
                      {item.name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3 pt-4">
              <NavLink
                to={
                  currentUser?.role === "superadmin"
                    ? "/dashboard"
                    : `/${currentUser?.department?.toLowerCase() || ""}`
                }
                className={({ isActive }) =>
                  [
                    "flex items-center w-full px-3 py-2 rounded-lg transition gap-2",
                    "hover:bg-gray-800 focus:outline-none",
                    isActive ? "bg-gray-800 text-white" : "text-gray-300",
                    sidebarCollapsed ? "justify-center" : "",
                  ].join(" ")
                }
                title="Back to CRM"
              >
                <Undo2 size={18} className="shrink-0" />
                <span
                  className={`ml-2 transition-opacity duration-200 whitespace-nowrap ${
                    showLabels ? "opacity-100" : "opacity-0"
                  } ${sidebarCollapsed ? "hidden" : "block"}`}
                >
                  Back to CRM
                </span>
              </NavLink>

              <button
                onClick={toggleSidebar}
                className={`hidden md:flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-gray-800 gap-2 ${
                  sidebarCollapsed ? "justify-center" : ""
                }`}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={18} />
                ) : (
                  <ChevronLeft size={18} />
                )}
                <span
                  className={`ml-2 transition-opacity duration-200 text-gray-300 whitespace-nowrap ${
                    showLabels ? "opacity-100" : "opacity-0"
                  } ${sidebarCollapsed ? "hidden" : "block"}`}
                >
                  Collapse Menu
                </span>
              </button>
            </div>
          </aside>
        )}

        <main className="flex-1 bg-black overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TaskLayout;
