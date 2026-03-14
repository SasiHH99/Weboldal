import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

export function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  };
}

export function createServiceClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

export function getBearerToken(headers = {}) {
  const auth = headers.authorization || headers.Authorization || "";
  if (!auth.startsWith("Bearer ")) return "";
  return auth.slice(7).trim();
}

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function isValidEmail(email = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function generatePassword() {
  return crypto.randomBytes(9).toString("base64url").slice(0, 12);
}

export async function verifyAdminFromEvent(event) {
  const supabase = createServiceClient();
  const token = getBearerToken(event.headers || {});

  if (!token) {
    return { ok: false, response: json(401, { error: "Missing bearer token" }) };
  }

  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    return { ok: false, response: json(401, { error: "Invalid token" }) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { ok: false, response: json(403, { error: "Forbidden" }) };
  }

  return { ok: true, supabase, user: authData.user };
}

export async function sendResendMail({ to, subject, html, from, replyTo }) {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY env var");
  }

  const payload = { from, to, subject, html };
  if (replyTo) payload.reply_to = replyTo;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details.slice(0, 500));
  }
}

export function createGalleryMailHtml({ heading, intro, email, password, ctaText, ctaUrl }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#0f1117;color:#f3efe5;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#171a22;border:1px solid rgba(214,179,106,.18);border-radius:20px;padding:28px;">
        <p style="margin:0 0 12px;color:#d6b36a;letter-spacing:.18em;text-transform:uppercase;font-size:12px;">B. Photography</p>
        <h2 style="margin:0 0 18px;font-size:28px;color:#f3efe5;">${heading}</h2>
        <p style="margin:0 0 24px;line-height:1.7;color:#ddd7ca;">${intro}</p>
        <div style="margin:18px 0;padding:18px;border-radius:16px;background:#10131a;border:1px solid rgba(255,255,255,.06);">
          <p style="margin:0 0 8px;color:#a9a396;">Email</p>
          <p style="margin:0 0 16px;color:#f3efe5;">${escapeHtml(email)}</p>
          <p style="margin:0 0 8px;color:#a9a396;">Jelszó / Passwort</p>
          <p style="margin:0;color:#f3efe5;font-size:20px;letter-spacing:.08em;">${escapeHtml(password)}</p>
        </div>
        <a href="${ctaUrl}" style="display:inline-block;margin-top:8px;padding:14px 22px;border-radius:999px;background:#d6b36a;color:#16120c;text-decoration:none;font-weight:700;">${ctaText}</a>
      </div>
    </div>
  `;
}
