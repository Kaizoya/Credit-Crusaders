import { supabase } from "../lib/supabase";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function assertSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  }

  return supabase;
}

async function sendMagicLinkEmail(email: string): Promise<void> {
  const client = assertSupabase();
  const normalizedEmail = normalizeEmail(email);

  const { error } = await client.auth.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) {
    throw new Error(error.message || "Unable to send magic link.");
  }
}

export async function requestLoginOtp(email: string): Promise<void> {
  const client = assertSupabase();
  const normalizedEmail = normalizeEmail(email);

  const { data: exists, error: existsError } = await client.rpc("is_signup_email_exists", {
    input_email: normalizedEmail,
  });

  if (existsError) {
    throw new Error(
      "Unable to validate email access. Create RPC function is_signup_email_exists in Supabase and grant execute to anon."
    );
  }

  if (!exists) {
    throw new Error("No account found for this email. Please sign up first.");
  }

  await sendMagicLinkEmail(normalizedEmail);
}

export async function sendSignupConfirmationMagicLink(email: string): Promise<void> {
  await sendMagicLinkEmail(email);
}

export async function verifyLoginOtp(email: string, otp: string): Promise<void> {
  const client = assertSupabase();
  const normalizedEmail = normalizeEmail(email);

  const { error } = await client.auth.verifyOtp({
    email: normalizedEmail,
    token: otp.trim(),
    type: "email",
  });

  if (error) {
    throw new Error(error.message || "Invalid or expired OTP.");
  }
}
