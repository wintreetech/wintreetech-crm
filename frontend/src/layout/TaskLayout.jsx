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
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  logoutUser,
  selectAuthLoading,
  selectCurrentUser,
} from "../store/slices/Auth.slice.js";
import { fetchUsers } from "../store/slices/Users.slice.js";

function TaskLayout() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile open/close

  // ✅ desktop collapse (persistent)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("taskSidebarCollapsed");
    return saved === "true";
  });

  const [showLabels, setShowLabels] = useState(!sidebarCollapsed); // ✅ delayed text
  const expandTimerRef = useRef(null);

  const [avatarOpen, setAvatarOpen] = useState(false);

  const currentUser = useSelector(selectCurrentUser);

  const showSidebar =
    currentUser.role === "superadmin" ||
    currentUser.role === "admin" ||
    currentUser.role === "user";

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
        typeof e === "string" ? e : "Logout failed (cleared locally)"
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

    if (segments.includes("workspaces")) {
      return "Workspaces Dashboard";
    }

    const last = segments[segments.length - 1];

    if (last === "dashboard" && user?.role === "superadmin") {
      return "Management Dashboard";
    }

    return last.charAt(0).toUpperCase() + last.slice(1) + " Dashboard";
  };

  // Fetch all users on mount
  useEffect(() => {
    dispatch(fetchUsers())
      .unwrap()
      .catch((err) => {
        toast.error(err || "Failed to fetch users");
      });
  }, [dispatch]);

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
    if (currentUser.role === "superadmin") return true;
    if (item.department && currentUser.department !== item.department)
      return false;
    return true;
  });

  // ✅ labels appear only AFTER expand ends
  useEffect(() => {
    if (expandTimerRef.current) clearTimeout(expandTimerRef.current);

    if (!sidebarCollapsed) {
      expandTimerRef.current = setTimeout(() => {
        setShowLabels(true);
      }, 100); // matches transition duration
    } else {
      setShowLabels(false);
    }

    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, [sidebarCollapsed]);

  // ✅ persist collapse state
  const toggleCollapse = () => {
    setSidebarCollapsed((v) => {
      const next = !v;
      localStorage.setItem("taskSidebarCollapsed", String(next));
      return next;
    });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOP HEADER */}
      <header className="flex justify-between items-center bg-gray-900 text-white px-4 py-2 shadow-md">
        {/* Left: Page Info */}
        <div>
          <h1 className="text-xl font-semibold leading-tight">{pageTitle}</h1>
          <p className="text-gray-400 text-xs">
            (
            {currentUser.department.charAt(0).toUpperCase() +
              currentUser.department.slice(1)}
            )
          </p>
        </div>

        {/* Right: Avatar Dropdown */}
        <div className="relative">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/tasks/notifications")}
              className="hover:bg-gray-50/20 p-2 rounded-lg cursor-pointer"
            >
              <Bell />
            </button>
            <div className="flex flex-col justify-end items-end">
              <p className="text-lg font-semibold text-white capitalize">
                hi, {currentUser?.username.split(" ")[0]}
              </p>
              <p className="text-sm text-gray-300">{currentUser?.role}</p>
            </div>
            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="bg-white text-black w-10 h-10 rounded-full flex items-center justify-center text-[18px] font-semibold shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              {currentUser?.username.charAt(0).toUpperCase()}
            </button>
          </div>

          {avatarOpen && (
            <ul className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl p-2 z-50 text-sm border border-gray-200">
              <li>
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 font-medium transition"
                >
                  Logout
                </button>
              </li>
            </ul>
          )}
        </div>
      </header>

      {/* LAYOUT */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        {showSidebar && (
          <aside
            className={`
              fixed md:static top-0 left-0 h-full bg-gray-900 text-white p-4 
              transition-all duration-300 ease-in-out z-40 flex flex-col justify-between
              ${sidebarCollapsed ? "w-20" : "w-64"}
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }
            `}
          >
            {/* Close button for mobile */}
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
                  >
                    {/* ✅ icon always visible */}
                    <span className="shrink-0">{item.icon}</span>

                    {/* ✅ labels appear only after expand */}
                    <span
                      className={`
                        ml-2 transition-opacity duration-200 whitespace-nowrap
                        ${showLabels ? "opacity-100" : "opacity-0"}
                        ${sidebarCollapsed ? "hidden" : "block"}
                      `}
                    >
                      {item.name}
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex flex-col gap-3">
              <ul className="space-y-2">
                <li>
                  <NavLink
                    to={
                      currentUser?.role === "superadmin" ||
                      currentUser?.role === "admin"
                        ? "/dashboard"
                        : `/${
                            ["sales", "finance", "recon", "support"].includes(
                              currentUser?.department?.toLowerCase()
                            )
                              ? currentUser.department.toLowerCase()
                              : ""
                          }`
                    }
                    className={({ isActive }) =>
                      [
                        "flex items-center w-full px-3 py-2 rounded-lg transition gap-2",
                        "hover:bg-gray-800 focus:outline-none",
                        isActive ? "bg-gray-800 text-white" : "text-gray-300",
                        sidebarCollapsed ? "justify-center" : "",
                      ].join(" ")
                    }
                  >
                    <Undo2 size={18} className="shrink-0" />

                    <span
                      className={`
                        ml-2 transition-opacity duration-200 whitespace-nowrap
                        ${showLabels ? "opacity-100" : "opacity-0"}
                        ${sidebarCollapsed ? "hidden" : "block"}
                      `}
                    >
                      Back to CRM
                    </span>
                  </NavLink>
                </li>
              </ul>

              {/* ✅ bottom collapse toggle */}
              <button
                onClick={toggleCollapse}
                className={`
                  flex items-center w-full px-3 py-2 rounded-lg transition hover:bg-gray-800 gap-2
                  ${sidebarCollapsed ? "justify-center" : ""}
                `}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={18} className="shrink-0" />
                ) : (
                  <ChevronLeft size={18} className="shrink-0" />
                )}

                <span
                  className={`
                    ml-2 transition-opacity duration-200 text-gray-300 whitespace-nowrap
                    ${showLabels ? "opacity-100" : "opacity-0"}
                    ${sidebarCollapsed ? "hidden" : "block"}
                  `}
                >
                  Collapse Menu
                </span>
              </button>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 bg-black overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default TaskLayout;
