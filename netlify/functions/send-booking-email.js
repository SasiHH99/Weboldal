const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(payload)
  };
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createMailTemplate({ subject, intro, name, email, bookingDate, packageName, message }) {
  return `
    <div style="font-family:Arial,sans-serif;background:#0f1117;color:#f3efe5;padding:32px;">
      <div style="max-width:640px;margin:0 auto;background:#171a22;border:1px solid rgba(214,179,106,.18);border-radius:20px;padding:28px;">
        <p style="margin:0 0 12px;color:#d6b36a;letter-spacing:.18em;text-transform:uppercase;font-size:12px;">B. Photography</p>
        <h2 style="margin:0 0 18px;font-size:28px;color:#f3efe5;">${subject}</h2>
        <p style="margin:0 0 24px;line-height:1.7;color:#ddd7ca;">${intro}</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:10px 0;color:#a9a396;">Név / Name</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(name)}</td></tr>
          <tr><td style="padding:10px 0;color:#a9a396;">Email</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(email)}</td></tr>
          <tr><td style="padding:10px 0;color:#a9a396;">Dátum / Date</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(bookingDate)}</td></tr>
          <tr><td style="padding:10px 0;color:#a9a396;">Csomag / Package</td><td style="padding:10px 0;color:#f3efe5;">${escapeHtml(packageName)}</td></tr>
        </table>
        <div style="margin-top:20px;padding:16px;border-radius:14px;background:#10131a;border:1px solid rgba(255,255,255,.06);">
          <p style="margin:0 0 8px;color:#a9a396;text-transform:uppercase;letter-spacing:.12em;font-size:12px;">Üzenet / Message</p>
          <p style="margin:0;line-height:1.7;color:#f3efe5;">${escapeHtml(message || "-")}</p>
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

  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.BOOKING_FROM_EMAIL || "B. Photography <noreply@bphoto.at>";
  const to = process.env.BOOKING_TO_EMAIL || "info@bphoto.at";
  const replyTo = process.env.BOOKING_REPLY_TO || "";

  if (!resendApiKey) {
    return json(500, { error: "Missing RESEND_API_KEY env var" });
  }

  try {
    const data = JSON.parse(event.body || "{}");

    const bookingDate = data.booking_date || "";
    const name = data.name || "";
    const email = data.email || "";
    const packageName = data.package || "";
    const message = data.message || "";
    const lang = data.lang === "hu" ? "hu" : "de";

    if (!bookingDate || !name || !email || !packageName) {
      return json(400, { error: "Missing required fields" });
    }

    const subject =
      lang === "hu" ? `Új foglalási kérés - ${name}` : `Neue Buchungsanfrage - ${name}`;

    const intro =
      lang === "hu"
        ? "Érkezett egy új foglalási kérés a weboldalról."
        : "Es ist eine neue Buchungsanfrage uber die Website eingegangen.";

    const payload = {
      from,
      to,
      subject,
      html: createMailTemplate({
        subject,
        intro,
        name,
        email,
        bookingDate,
        packageName,
        message
      })
    };

    if (replyTo) {
      payload.reply_to = replyTo;
    }

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
      return json(502, {
        error: "Email provider error",
        details: details.slice(0, 500)
      });
    }

    return json(200, { success: true });
  } catch (error) {
    return json(500, {
      error: "Server error",
      details: String(error?.message || error)
    });
  }
};
