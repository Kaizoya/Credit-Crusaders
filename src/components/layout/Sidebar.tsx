import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

type NavIconName = "dashboard" | "report" | "alerts" | "simulator" | "settings";

export const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: "dashboard" as NavIconName },
  { label: "Credit Report", path: "/credit-report", icon: "report" as NavIconName },
  { label: "Alerts", path: "/alerts", icon: "alerts" as NavIconName },
  { label: "Score Simulator", path: "/score-simulator", icon: "simulator" as NavIconName },
  { label: "Settings", path: "/settings", icon: "settings" as NavIconName },
];

interface SidebarProps {
  expanded: boolean;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  displayName: string;
  avatarLabel: string;
  profileEmail: string;
  profilePhone: string;
  profilePan: string;
  onLogout: () => void | Promise<void>;
}

function NavIcon({ icon }: { icon: NavIconName }) {
  const classes = "h-5 w-5 shrink-0";

  if (icon === "dashboard") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} aria-hidden="true">
        <path d="M4 4h7v7H4V4Zm9 0h7v5h-7V4ZM4 13h5v7H4v-7Zm7 0h9v7h-9v-7Z" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} aria-hidden="true">
        <path d="M6 3h9l5 5v13H6V3Zm8 1.5V9h4.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "alerts") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} aria-hidden="true">
        <path d="M12 3a5 5 0 0 0-5 5v2.6c0 .7-.2 1.4-.6 2L5 15h14l-1.4-2.4a4 4 0 0 1-.6-2V8a5 5 0 0 0-5-5Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === "simulator") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className={classes} aria-hidden="true">
        <path d="M4 14a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M12 14l5-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="14" r="1.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className={classes} aria-hidden="true">
      <path
        d="M12 3.5l1.1 1.8a6.8 6.8 0 0 1 1.8.8l2-.7 1.4 1.4-.7 2c.3.6.6 1.2.8 1.8l1.8 1.1v2l-1.8 1.1a6.8 6.8 0 0 1-.8 1.8l.7 2-1.4 1.4-2-.7c-.6.3-1.2.6-1.8.8L12 20.5h-2l-1.1-1.8a6.8 6.8 0 0 1-1.8-.8l-2 .7-1.4-1.4.7-2a6.8 6.8 0 0 1-.8-1.8L2.5 13v-2l1.8-1.1c.2-.6.5-1.2.8-1.8l-.7-2 1.4-1.4 2 .7c.6-.3 1.2-.6 1.8-.8L10 3.5h2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function Sidebar({
  expanded,
  onHoverStart,
  onHoverEnd,
  displayName,
  avatarLabel,
  profileEmail,
  profilePhone,
  profilePan,
  onLogout,
}: SidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <aside
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      className={[
        "glass fixed bottom-4 left-4 top-4 z-20 hidden overflow-visible rounded-2xl p-4 transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:flex-col md:bottom-6 md:left-6 md:top-6",
        expanded ? "w-64" : "w-20",
      ].join(" ")}
    >
      <div className={["mb-6", expanded ? "flex items-center justify-between" : "flex flex-col items-center gap-2"].join(" ")}>
        {expanded ? (
          <div>
            <p className="text-lg font-bold text-white">CreditWise</p>
            <p className="text-xs text-slate-400">Financial Health</p>
          </div>
        ) : (
          <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-stroke">
            <p className="text-sm font-bold text-white">CW</p>
          </div>
        )}

        {expanded && <div className="h-9 w-9 rounded-lg border border-transparent" aria-hidden="true" />}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition",
                  expanded ? "justify-start" : "justify-center px-0",
                  isActive ? "bg-blueGlow text-white shadow-lg shadow-blueGlow/30" : "text-slate-300 hover:bg-slate-800/60",
                ].join(" ")
              }
              title={!expanded ? item.label : undefined}
            >
              <NavIcon icon={item.icon} />
              {expanded && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className={["mt-auto relative", expanded ? "" : "flex justify-center"].join(" ")} ref={profileMenuRef}>
        <button
          type="button"
          onClick={() => setProfileOpen((prev) => !prev)}
          className={[
            "border border-stroke bg-panel/70 text-white transition hover:border-blueGlow",
            expanded
              ? "w-full rounded-xl p-2 flex items-center gap-3 justify-start"
              : "h-12 w-12 rounded-full p-0 flex items-center justify-center",
          ].join(" ")}
          aria-label="Open profile menu"
          title={!expanded ? displayName : undefined}
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-panel text-sm font-semibold">
            {avatarLabel}
          </span>
          {expanded && (
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-semibold">{displayName}</span>
              <span className="block truncate text-xs text-slate-400">{profileEmail}</span>
            </span>
          )}
        </button>

        {profileOpen && (
          <div className="absolute bottom-full -left-3 z-50 mb-3 w-[252px] rounded-2xl border border-stroke bg-[#10161f] p-4 shadow-2xl">
            <p className="text-base font-semibold text-white">{displayName}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Email:</span> {profileEmail}
              </p>
              <p>
                <span className="text-slate-400">Phone:</span> {profilePhone}
              </p>
              <p>
                <span className="text-slate-400">PAN:</span> {profilePan}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="mt-4 h-10 w-full rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
