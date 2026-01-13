import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart,
  Calculator,
  ClipboardList,
  DollarSign,
  Headphones,
  LayoutDashboard,
  Users,
  X,
  ChevronRight,
  ChevronLeft,
  TextAlignJustify,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  logout,
  logoutUser,
  selectAuthLoading,
  selectCurrentUser,
} from "../store/slices/Auth.slice.js";
import { fetchUsers } from "../store/slices/Users.slice.js";
import { useSidebarCollapse } from "../hooks/useSidebarCollapse.js";

function MainLayout() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile open/close

  // ✅ desktop collapse (persistent)
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  //   const saved = localStorage.getItem("mainSidebarCollapsed");
  //   return saved === "true";
  // });

  const { sidebarCollapsed, toggleSidebar } = useSidebarCollapse();

  const [showLabels, setShowLabels] = useState(!sidebarCollapsed); // delayed labels
  const expandTimerRef = useRef(null);

  const [avatarOpen, setAvatarOpen] = useState(false);

  const currentUser = useSelector(selectCurrentUser);

  const showSidebar =
    currentUser.role === "superadmin" || currentUser.role === "admin";

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

    const name = path.replace("/", "").toLowerCase();

    if (name === "dashboard" && user?.role === "superadmin") {
      return "Management Dashboard";
    }

    return name.charAt(0).toUpperCase() + name.slice(1) + " Dashboard";
  };

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
      name: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "dashboard",
      roles: ["superadmin"],
      department: "management",
    },
    {
      name: "Users",
      icon: <Users size={18} />,
      path: "users",
      roles: ["superadmin", "admin"],
    },
    {
      name: "Sales",
      icon: <BarChart size={18} />,
      path: "sales",
      roles: ["superadmin", "admin", "user"],
      department: "sales",
    },
    {
      name: "Support",
      icon: <Headphones size={18} />,
      path: "support",
      roles: ["superadmin", "admin", "user"],
      department: "support",
    },
    {
      name: "Recon",
      icon: <Calculator size={18} />,
      path: "recon",
      roles: ["superadmin", "admin", "user"],
      department: "recon",
    },
    {
      name: "Finance",
      icon: <DollarSign size={18} />,
      path: "finance",
      roles: ["superadmin", "admin", "user"],
      department: "finance",
    },
    {
      name: "Tasks",
      icon: <ClipboardList size={18} />,
      path: `${
        currentUser.role === "superadmin" ? "tasks/analytics" : "tasks/mytasks"
      }`,
      roles: ["superadmin", "admin", "user"],
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
      }, 100);
    } else {
      setShowLabels(false);
    }

    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current);
    };
  }, [sidebarCollapsed]);

  return (
    <div className="h-screen flex flex-col">
      {/* TOP HEADER */}
      <header className="flex flex-wrap md:flex-nowrap justify-between items-center gap-3 bg-gray-900 text-white px-4 py-2 shadow-md">
        {/* ✅ Mobile menu open button */}
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
          <h1 className="text-base sm:text-lg md:text-xl font-semibold leading-tight truncate">
            {pageTitle}
          </h1>
          <p className="text-gray-400 text-xs truncate">
            (
            {currentUser.department.charAt(0).toUpperCase() +
              currentUser.department.slice(1)}
            )
          </p>
        </div>

        {/* Right: Avatar Dropdown */}
        <div className="relative shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex flex-col justify-end items-end">
              <p className="text-base sm:text-lg font-semibold text-white capitalize">
                hi, {currentUser?.username.split(" ")[0]}
              </p>
              <p className="text-xs sm:text-sm text-gray-300">
                {currentUser?.role}
              </p>
            </div>

            <button
              onClick={() => setAvatarOpen(!avatarOpen)}
              className="bg-white text-black w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[16px] sm:text-[18px] font-semibold shadow-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
            >
              {currentUser?.username.charAt(0).toUpperCase()}
            </button>
          </div>

          {avatarOpen && (
            <ul className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl p-2 z-50 text-sm border border-gray-200">
              {currentUser?.role === "user" && (
                <li>
                  <button
                    onClick={() => navigate("tasks/mytasks")}
                    className="w-full text-left text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-md font-medium transition"
                  >
                    Tasks
                  </button>
                </li>
              )}
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
        {showSidebar && (
          <aside
            className={`
              fixed md:static top-0 left-0 h-full bg-gray-900 text-white p-4 
              transition-all duration-300 ease-in-out z-40 flex flex-col
              justify-start md:justify-between
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
                    title={item.name}
                  >
                    <span className="shrink-0">{item.icon}</span>

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

            {/* ✅ bottom collapse toggle (desktop only) */}
            <button
              onClick={toggleSidebar}
              className={`
                hidden md:flex mt-auto items-center w-full px-3 py-2 rounded-lg transition hover:bg-gray-800 gap-2
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

export default MainLayout;
