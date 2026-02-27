import { supabase } from "../lib/supabase";

export type SignUpPayload = {
  email: string;
  firstName: string;
  lastName: string;
  pan: string;
  dob: string;
  pinCode: string;
  phone: string;
};

export type SignupProfile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  pan: string | null;
};

type SignupRow = {
  first_name?: string;
  firstName?: string;
  last_name?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  phone_number?: string | null;
  phoneNumber?: string | null;
  pan?: string | null;
};

function mapSignupRow(row: SignupRow | null | undefined, fallbackEmail: string): SignupProfile | null {
  if (!row) return null;

  const firstName = (row.first_name ?? row.firstName ?? "").trim();
  const lastName = (row.last_name ?? row.lastName ?? "").trim();
  const phoneValue = row.phone ?? row.phone_number ?? row.phoneNumber ?? null;
  const panValue = row.pan ?? null;

  return {
    firstName,
    lastName,
    email: (row.email ?? fallbackEmail).trim().toLowerCase(),
    phone: phoneValue ? String(phoneValue).trim() : null,
    pan: panValue ? String(panValue).trim().toUpperCase() : null,
  };
}

export async function saveSignup(payload: SignUpPayload): Promise<void> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  }

  const email = payload.email.trim().toLowerCase();
  const firstName = payload.firstName.trim();
  const lastName = payload.lastName.trim();
  const pan = payload.pan.trim().toUpperCase();
  const dob = payload.dob.trim();
  const pinCode = payload.pinCode.trim();
  const phone = payload.phone.trim();

  if (!email || !firstName || !lastName || !pan || !dob || !pinCode || !phone) {
    throw new Error("All signup fields are required.");
  }

  const { error } = await supabase.from("signups").insert({
    email,
    first_name: firstName,
    last_name: lastName,
    pan,
    dob,
    pin_code: pinCode,
    phone,
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("This email is already registered.");
    }

    throw new Error(error.message || "Unable to save sign up details.");
  }
}

export async function getSignupPanByEmail(email: string): Promise<string | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  }

  const { data, error } = await supabase.rpc("get_signup_pan_by_email", {
    input_email: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error("Unable to find PAN for this account.");
  }

  if (!data) {
    return null;
  }

  return String(data).trim().toUpperCase();
}

export async function getSignupProfileByEmail(email: string): Promise<SignupProfile | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Primary path: read profile directly from signups table.
  const { data: tableData, error: tableError } = await supabase
    .from("signups")
    .select("first_name,last_name,email,phone,pan")
    .ilike("email", normalizedEmail)
    .maybeSingle<SignupRow>();

  if (!tableError) {
    const mappedFromTable = mapSignupRow(tableData, normalizedEmail);
    if (mappedFromTable) {
      return mappedFromTable;
    }
  }

  // Fallback path: RPC for environments where table select is restricted by RLS.
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_signup_profile_by_email", {
    input_email: normalizedEmail,
  });

  if (rpcError) {
    throw new Error("Unable to load profile details.");
  }

  const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as SignupRow | undefined;
  return mapSignupRow(row, normalizedEmail);
}

export async function getSignupProfileByPan(pan: string): Promise<SignupProfile | null> {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.");
  }

  const normalizedPan = pan.trim().toUpperCase();
  if (!normalizedPan) return null;

  // Primary path: read profile directly from signups table.
  const { data: tableData, error: tableError } = await supabase
    .from("signups")
    .select("first_name,last_name,email,phone,pan")
    .eq("pan", normalizedPan)
    .maybeSingle<SignupRow>();

  if (!tableError) {
    const mappedFromTable = mapSignupRow(tableData, "");
    if (mappedFromTable) {
      return mappedFromTable;
    }
  }

  // Fallback path: RPC for environments where table select is restricted by RLS.
  const { data: rpcData, error: rpcError } = await supabase.rpc("get_signup_profile_by_pan", {
    input_pan: normalizedPan,
  });

  if (rpcError) {
    return null;
  }

  const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as SignupRow | undefined;
  return mapSignupRow(row, "");
}
