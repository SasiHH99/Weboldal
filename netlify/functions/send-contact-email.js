import {
  CORS_HEADERS,
  json,
  normalizeEmail,
  isValidEmail,
  createServiceClient,
  escapeHtml,
  sendResendMail
} from "./_admin.js";

function createMailHtml({ heading, intro, name, email, message }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#0f1117;color:#f3efe5;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#171a22;border:1px solid rgba(214,179,106,.18);border-radius:20px;padding:28px;">
        <p style="margin:0 0 12px;color:#d6b36a;letter-spacing:.18em;text-transform:uppercase;font-size:12px;">B. Photography</p>
        <h2 style="margin:0 0 18px;font-size:28px;color:#f3efe5;">${heading}</h2>
        <p style="margin:0 0 24px;line-height:1.7;color:#ddd7ca;">${intro}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;color:#a9a396;">Name</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:10px 0;color:#a9a396;">Email</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(email)}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;border-radius:14px;background:#10131a;border:1px solid rgba(255,255,255,.06);">
          <p style="margin:0 0 8px;color:#a9a396;text-transform:uppercase;letter-spacing:.12em;font-size:12px;">Üzenet / Nachricht</p>
          <p style="margin:0;line-height:1.7;color:#f3efe5;">${escapeHtml(message)}</p>
        </div>
      </div>
    </div>
  `;
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  const from = process.env.CONTACT_FROM_EMAIL || "B. Photography <noreply@bphoto.at>";
  const to = process.env.CONTACT_TO_EMAIL || "busi.sandor@bphoto.at";
  const supabase = createServiceClient();

  try {
    const data = JSON.parse(event.body || "{}");
    const lang = data.lang === "hu" ? "hu" : "de";
    const name = String(data.name || "").trim();
    const email = normalizeEmail(data.email || "");
    const message = String(data.message || "").trim();

    if (!name || !email || !message) {
      return json(400, { error: "Missing required fields" });
    }

    if (!isValidEmail(email)) {
      return json(400, { error: "Invalid email format" });
    }

    const heading = lang === "hu" ? "Új kapcsolatfelvétel" : "Neue Kontaktanfrage";
    const intro =
      lang === "hu"
        ? "Érkezett egy új üzenet a kapcsolat oldalról."
        : "Es ist eine neue Nachricht über das Kontaktformular eingegangen.";

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name,
      email,
      message,
      lang,
      status: "new",
      source: "contact_form"
    });

    if (insertError) {
      console.error("contact_messages insert failed", insertError);
    }

    await sendResendMail({
      from,
      to,
      replyTo: email,
      subject: `${heading} - ${name}`,
      html: createMailHtml({ heading, intro, name, email, message })
    });

    return json(200, { success: true, stored: !insertError });
  } catch (error) {
    return json(500, {
      error: "Server error",
      details: String(error?.message || error)
    });
  }
};
