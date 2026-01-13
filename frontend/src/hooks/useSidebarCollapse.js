import { useEffect, useState } from "react";

const STORAGE_KEY = "mainSidebarCollapsed";

export function useSidebarCollapse() {
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "true";
  });

  // ✅ keep localStorage in sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  // ✅ listen for changes from other layouts / tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        setCollapsed(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggle = () => setCollapsed((v) => !v);

  return {
    sidebarCollapsed: collapsed,
    setSidebarCollapsed: setCollapsed,
    toggleSidebar: toggle,
  };
}
