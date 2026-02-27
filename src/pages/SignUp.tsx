import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchCreditReport } from "../services/bureauApi";
import { sendSignupConfirmationMagicLink } from "../services/authApi";
import { saveSignup } from "../services/signupApi";
import { CreditReport } from "../types/credit.types";

const initialForm = {
  email: "",
  firstName: "",
  lastName: "",
  pan: "",
  dob: "",
  pinCode: "",
  phone: "",
};

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isPanValid = /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.pan.trim().toUpperCase());
  const isPinValid = /^\d{6}$/.test(form.pinCode.trim());
  const isPhoneValid = /^\d{10}$/.test(form.phone.trim());
  const isDobValid = form.dob.trim().length > 0;
  const canContinue =
    isEmailValid &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    isPanValid &&
    isDobValid &&
    isPinValid &&
    isPhoneValid;
  const unmetRules = [
    !isEmailValid ? "Enter a valid email address" : null,
    form.firstName.trim().length === 0 ? "First name is required" : null,
    form.lastName.trim().length === 0 ? "Last name is required" : null,
    !isPanValid ? "PAN must be in format ABCDE1234F" : null,
    !isDobValid ? "Date of birth is required" : null,
    !isPinValid ? "Pin code must be 6 digits" : null,
    !isPhoneValid ? "Phone number must be 10 digits" : null,
  ].filter(Boolean) as string[];

  const handleChange = (field: keyof typeof initialForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    setError(null);

    try {
      await saveSignup(form);
      await sendSignupConfirmationMagicLink(form.email);
      sessionStorage.setItem(
        "signupProfile",
        JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          pan: form.pan.trim().toUpperCase(),
        })
      );
      const data: CreditReport = await fetchCreditReport(form.pan);
      sessionStorage.setItem("creditReport", JSON.stringify(data));
      sessionStorage.setItem("creditPan", form.pan.toUpperCase());
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete signup.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-fintech-gradient px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="space-y-5">
          <header className="glass rounded-3xl p-6 text-center">
            <p className="text-sm font-semibold text-blue-200">CreditWise</p>
            <h1 className="mt-3 text-3xl font-bold text-white">Sign Up</h1>
            <p className="mt-2 text-sm text-slate-400">Create your profile and pull the bureau report by PAN.</p>
          </header>

          <div className="flex justify-center">
            <div className="glass w-full max-w-3xl rounded-3xl p-6 shadow-glass">
              <h2 className="text-xl font-semibold text-white">Personal Details</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Phone number
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))
                    }
                    maxLength={10}
                    inputMode="numeric"
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  First Name
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Last Name
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  PAN
                  <input
                    type="text"
                    value={form.pan}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        pan: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10),
                      }))
                    }
                    maxLength={10}
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Date of birth
                  <input
                    type="date"
                    value={form.dob}
                    onChange={handleChange("dob")}
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
                <label className="flex flex-col gap-2 text-sm text-slate-300">
                  Pin code
                  <input
                    type="text"
                    value={form.pinCode}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, pinCode: event.target.value.replace(/\D/g, "").slice(0, 6) }))
                    }
                    maxLength={6}
                    inputMode="numeric"
                    required
                    className="h-11 rounded-xl border border-stroke bg-panel/70 px-4 text-sm text-white outline-none focus:border-blueGlow"
                  />
                </label>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={loading || !canContinue}
                  className="h-11 rounded-xl bg-blueGlow px-6 text-sm font-semibold text-white shadow-lg shadow-blueGlow/40 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Processing..." : "Continue to Dashboard"}
                </button>
              </div>

              {!canContinue && (
                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  {unmetRules[0]}
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-rose-500/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SignUp;
