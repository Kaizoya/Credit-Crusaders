import { ReactNode, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { getSignupProfileByEmail, getSignupProfileByPan, SignupProfile } from "../../services/signupApi";
import Sidebar, { navItems } from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}

const toTitleCase = (value: string) =>
  value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

const deriveNameFromEmail = (email: string) => {
  const localPart = (email.split("@")[0] ?? "").toLowerCase();
  const sanitized = localPart.replace(/[0-9]+/g, " ").trim();
  const withSeparators = sanitized.replace(/[._-]+/g, " ").replace(/\s+/g, " ").trim();

  let candidate = withSeparators;
  if (candidate && !candidate.includes(" ") && candidate.length >= 8) {
    const splitIndex = Math.floor(candidate.length / 2);
    candidate = `${candidate.slice(0, splitIndex)} ${candidate.slice(splitIndex)}`;
  }

  return candidate ? toTitleCase(candidate) : "User";
};

const getInitials = (name: string) => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "U";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<SignupProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const collapseTimerRef = useRef<number | null>(null);

  const clearCollapseTimer = () => {
    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
  };

  const handleSidebarHoverStart = () => {
    clearCollapseTimer();
    setSidebarExpanded(true);
  };

  const handleSidebarHoverEnd = () => {
    clearCollapseTimer();
    collapseTimerRef.current = window.setTimeout(() => {
      setSidebarExpanded(false);
      collapseTimerRef.current = null;
    }, 180);
  };

  useEffect(
    () => () => {
      clearCollapseTimer();
    },
    [],
  );

  useEffect(() => {
    const cacheProfile = (data: SignupProfile) => {
      sessionStorage.setItem("signupProfile", JSON.stringify(data));
    };

    const readCachedProfile = () => {
      const raw = sessionStorage.getItem("signupProfile");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw) as SignupProfile;
        if (parsed) {
          setProfile(parsed);
          if (parsed.email) setUserEmail(parsed.email);
        }
      } catch {
        sessionStorage.removeItem("signupProfile");
      }
    };

    readCachedProfile();

    const client = supabase;
    if (!client) return;

    let cancelled = false;

    const hydrateProfile = async (email: string) => {
      if (!email) return;
      try {
        const data = await getSignupProfileByEmail(email);
        if (!cancelled) {
          setProfile(data);
          if (data) cacheProfile(data);
        }
      } catch {
        if (!cancelled) {
          setProfile(null);
        }
      }
    };

    const hydrateProfileByPan = async (pan: string) => {
      if (!pan) return;
      try {
        const data = await getSignupProfileByPan(pan);
        if (!cancelled && data) {
          setProfile(data);
          if (data.email) setUserEmail(data.email);
          cacheProfile(data);
        }
      } catch {
        // Ignore and keep best available profile state.
      }
    };

    const loadSession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      const email = session?.user?.email ?? "";
      if (cancelled) return;
      setUserEmail(email);
      if (email) {
        await hydrateProfile(email);
      } else {
        const cachedPan = sessionStorage.getItem("creditPan") ?? "";
        await hydrateProfileByPan(cachedPan);
      }
    };

    void loadSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email ?? "";
      setUserEmail(email);

      if (email) {
        void hydrateProfile(email);
      } else {
        const cachedPan = sessionStorage.getItem("creditPan") ?? "";
        if (cachedPan) {
          void hydrateProfileByPan(cachedPan);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const profileEmail = profile?.email || userEmail || "Not available";
  const fallbackName = profileEmail === "Not available" ? "User" : deriveNameFromEmail(profileEmail);
  const firstName = toTitleCase((profile?.firstName ?? "").trim());
  const lastName = toTitleCase((profile?.lastName ?? "").trim());
  const displayName = [firstName, lastName].filter(Boolean).join(" ") || fallbackName;
  const profilePhone = profile?.phone || "Not available";
  const profilePan = profile?.pan || sessionStorage.getItem("creditPan") || "Not available";
  const avatarLabel = getInitials(displayName);

  async function handleLogout() {
    const client = supabase;
    if (client) {
      await client.auth.signOut();
    }

    sessionStorage.removeItem("creditReport");
    sessionStorage.removeItem("creditPan");
    sessionStorage.removeItem("signupProfile");
    navigate("/", { replace: true });
  }

  return (
    <div className="h-screen overflow-hidden bg-fintech-gradient text-slate-100">
      <Sidebar
        expanded={sidebarExpanded}
        onHoverStart={handleSidebarHoverStart}
        onHoverEnd={handleSidebarHoverEnd}
        displayName={displayName}
        avatarLabel={avatarLabel}
        profileEmail={profileEmail}
        profilePhone={profilePhone}
        profilePan={profilePan}
        onLogout={handleLogout}
      />

      <button
        type="button"
        onClick={() => setMobileSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-panel/80 text-white lg:hidden"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1">
          <span className="block h-0.5 w-4 bg-white" />
          <span className="block h-0.5 w-4 bg-white" />
          <span className="block h-0.5 w-4 bg-white" />
        </span>
      </button>

      <main
        className={[
          "h-screen min-w-0 overflow-y-auto px-4 pb-6 pt-16 transition-[padding-left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:px-6 md:pb-8 md:pt-10 lg:pb-6 lg:pt-6",
          sidebarExpanded ? "lg:pl-[18rem]" : "lg:pl-[7rem]",
        ].join(" ")}
      >
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close mobile menu backdrop"
              onClick={() => setMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60"
            />
            <aside className="glass absolute inset-y-0 left-0 w-72 rounded-r-2xl p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-white">CreditWise</p>
                  <p className="text-xs text-slate-400">Financial Health</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="h-9 rounded-lg border border-stroke px-3 text-sm text-slate-200 transition hover:border-blueGlow"
                >
                  Close
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
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

              <div className="mt-6 rounded-xl border border-stroke bg-panel/70 p-3">
                <p className="text-sm font-semibold text-white">{displayName}</p>
                <p className="mt-1 text-xs text-slate-400">{profileEmail}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-3 h-9 w-full rounded-lg border border-rose-500/40 bg-rose-500/10 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                >
                  Log out
                </button>
              </div>
            </aside>
          </div>
        )}

        {children}
      </main>
    </div>
  );
}

export default AppShell;
