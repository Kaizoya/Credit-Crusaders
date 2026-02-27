import { NavLink } from "react-router-dom";

export const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Credit Report", path: "/credit-report" },
  { label: "Alerts", path: "/alerts" },
  { label: "Score Simulator", path: "/score-simulator" },
  { label: "Settings", path: "/settings" },
];

function Sidebar() {
  return (
    <aside className="glass hidden w-64 shrink-0 rounded-2xl p-6 lg:flex lg:flex-col self-start">
      <div>
        <div className="mb-10">
          <p className="text-xl font-bold text-white">CreditWise</p>
          <p className="text-xs text-slate-400">Financial Health</p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                [
                  "block w-full rounded-xl px-4 py-3 text-left text-sm transition",
                  isActive
                    ? "bg-blueGlow text-white shadow-lg shadow-blueGlow/30"
                    : "text-slate-300 hover:bg-slate-800/60",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
