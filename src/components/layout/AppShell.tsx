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
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

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
    <div className="min-h-screen bg-fintech-gradient p-4 text-slate-100 md:p-6">
      <div className="fixed left-0 right-0 top-0 z-30 p-4 md:p-6">
        <div className="mx-auto flex w-full max-w-7xl gap-5">
          <div className="hidden w-64 shrink-0 lg:block" />
          <nav className="glass flex-1 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-stroke bg-panel/70 text-white transition hover:border-blueGlow lg:hidden"
                  aria-label="Open menu"
                >
                  <span className="flex flex-col gap-1">
                    <span className="block h-0.5 w-4 bg-white" />
                    <span className="block h-0.5 w-4 bg-white" />
                    <span className="block h-0.5 w-4 bg-white" />
                  </span>
                </button>
                <p className="text-sm font-semibold text-slate-300">Navigation</p>
              </div>

              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-panel/70 text-sm font-semibold text-white transition hover:border-blueGlow"
                  aria-label="Open profile menu"
                >
                  {avatarLabel}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-72 rounded-2xl border border-stroke bg-[#10161f] p-4 shadow-2xl">
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
                      onClick={handleLogout}
                      className="mt-4 h-10 w-full rounded-xl border border-rose-500/40 bg-rose-500/10 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-7xl gap-5">
        <Sidebar />
        <main className="flex-1 min-w-0 space-y-5 pt-20 md:pt-24">

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
              </aside>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
