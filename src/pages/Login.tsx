import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { requestLoginOtp } from "../services/authApi";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const emailValue = email.trim().toLowerCase();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);
  const canSendOtp = isEmailValid && !sendingOtp;

  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let mounted = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (mounted && session) {
        navigate("/dashboard", { replace: true });
      }
    };

    void checkSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/dashboard", { replace: true });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  async function handleSendOtp() {
    if (!canSendOtp) return;

    setError(null);
    setMessage(null);
    setSendingOtp(true);

    try {
      await requestLoginOtp(emailValue);
      setOtpSent(true);
      setMessage("Login link sent successfully. Please check your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send login link.");
    } finally {
      setSendingOtp(false);
    }
  }

  return (
    <div className="min-h-screen bg-fintech-gradient px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="glass rounded-3xl p-6 text-center">
          <p className="text-sm font-semibold text-blue-200">CreditWise</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Log In</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your email to receive a secure login link.</p>
        </header>

        <section className="glass rounded-3xl p-6 shadow-glass">
          <form className="space-y-5">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setOtpSent(false);
                  setError(null);
                  setMessage(null);
                }}
                placeholder="you@example.com"
                className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
              />
            </label>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!canSendOtp}
              className="h-11 rounded-xl border border-stroke bg-panel/70 px-5 text-sm font-semibold text-white transition hover:border-blueGlow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendingOtp ? "Sending Login Link..." : otpSent ? "Resend Login Link" : "Send Login Link"}
            </button>
          </form>

          {message && (
            <div className="mt-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <Link to="/sign-up" className="text-blue-200 transition hover:text-blueGlow">
              New user? Sign up
            </Link>
            <Link to="/" className="text-slate-300 transition hover:text-white">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;
