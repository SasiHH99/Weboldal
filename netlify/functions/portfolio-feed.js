import { CORS_HEADERS, json, createServiceClient } from "./_admin.js";

const BUCKET = "portfolio-media";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return json(405, { error: "Method not allowed" });
  }

  const supabase = createServiceClient();

  try {
    const lang = event.queryStringParameters?.lang === "de" ? "de" : "hu";
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("is_active", true)
      .in("lang", [lang, "all"])
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      return json(200, { items: [] });
    }

    const items = await Promise.all(
      (data || []).map(async (item) => {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(BUCKET)
          .createSignedUrl(item.path, 3600);

        return {
          ...item,
          url: signedError ? "" : signedData?.signedUrl || ""
        };
      })
    );

    return json(200, { items: items.filter((item) => item.url) });
  } catch {
    return json(200, { items: [] });
  }
};
