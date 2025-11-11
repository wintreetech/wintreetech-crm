import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink } from "react-router-dom";

export default function SidebarSubmenu({
  asideRef,
  userRole = "user",
  allRoutes = [],
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, maxH: 360 });
  const [dept, setDept] = useState(null);
  const hideTimer = useRef(null);

  // refs for the bridge and the submenu panel (so we can detect pointer transitions)
  const bridgeRef = useRef(null);
  const panelRef = useRef(null);

  const clearHide = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  const delayedClose = () => {
    clearHide();
    hideTimer.current = setTimeout(() => setOpen(false), 250);
  };

  const routes = useMemo(() => {
    if (!dept) return [];
    return allRoutes.filter(
      (r) => r.department === dept && (!r.roles || r.roles.includes(userRole))
    );
  }, [dept, userRole, allRoutes]);

  useEffect(() => {
    const asideEl = asideRef?.current;
    if (!asideEl) return;

    const onMouseOver = (e) => {
      const li = e.target.closest("li[data-path]");
      if (!li || !asideEl.contains(li)) return;

      const liRect = li.getBoundingClientRect();
      const asideRect = asideEl.getBoundingClientRect();

      const left = Math.round(asideRect.right - 2); // flush to sidebar
      const vh = window.innerHeight;
      const guessH = 320;
      let top = Math.round(liRect.top);
      if (top + guessH > vh - 8) top = Math.max(8, vh - guessH - 8);

      setPos({ top, left, maxH: Math.round(vh * 0.75) });

      const path = li.dataset.path || "";
      const department =
        li.dataset.department || path.replace(/^\//, "").split("/")[0] || null;
      setDept(department);

      clearHide();
      setOpen(true);
    };

    const isInsideNode = (node, target) =>
      !!node && !!target && (node === target || node.contains(target));

    const onMouseLeaveAside = (e) => {
      // IMPORTANT: only close if we are NOT moving into the bridge or submenu
      const next = e.relatedTarget;
      if (
        isInsideNode(bridgeRef.current, next) ||
        isInsideNode(panelRef.current, next)
      ) {
        // moving into submenu area → keep open
        return;
      }
      // truly left both sidebar and submenu → close (with delay)
      delayedClose();
    };

    asideEl.addEventListener("mouseover", onMouseOver);
    asideEl.addEventListener("mouseleave", onMouseLeaveAside);
    return () => {
      asideEl.removeEventListener("mouseover", onMouseOver);
      asideEl.removeEventListener("mouseleave", onMouseLeaveAside);
    };
  }, [asideRef]);

  if (!open || routes.length === 0) return null;

  const bridgeWidth = 10;
  const submenuW = 220;

  return createPortal(
    <>
      {/* Hover bridge: prevents flicker when crossing from sidebar to submenu */}
      <div
        ref={bridgeRef}
        className="hidden md:block fixed z-50"
        style={{
          top: pos.top,
          left: pos.left - bridgeWidth,
          width: bridgeWidth,
          height: pos.maxH,
        }}
        onMouseEnter={clearHide}
        onMouseLeave={delayedClose}
      />
      {/* Submenu */}
      <div
        ref={panelRef}
        className="hidden md:block fixed z-50"
        style={{ top: pos.top, left: pos.left }}
        onMouseEnter={clearHide}
        onMouseLeave={delayedClose}
      >
        <div
          className="bg-gray-900 text-white rounded-lg shadow-xl border border-gray-800"
          style={{ minWidth: submenuW, maxHeight: pos.maxH, overflowY: "auto" }}
        >
          <ul className="py-2">
            {routes.map((r) => (
              <li key={r.path}>
                <NavLink
                  to={r.path}
                  className={({ isActive }) =>
                    [
                      "block px-3 py-2 mx-2 text-sm transition whitespace-nowrap rounded-md",
                      isActive
                        ? "bg-gray-800 text-white"
                        : "hover:bg-gray-800 text-gray-100 ",
                    ].join(" ")
                  }
                >
                  {r.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>,
    document.body
  );
}
