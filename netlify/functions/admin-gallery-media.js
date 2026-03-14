import { CORS_HEADERS, json, verifyAdminFromEvent } from "./_admin.js";

const BUCKET = "client-galleries";

async function createSignedFileList(supabase, userId) {
  const { data: fileList, error: fileError } = await supabase.storage.from(BUCKET).list(userId, {
    limit: 200,
    sortBy: { column: "name", order: "asc" }
  });

  if (fileError) throw fileError;

  const files = (fileList || []).filter((file) => file.name);
  const signedItems = await Promise.all(
    files.map(async (file) => {
      const path = `${userId}/${file.name}`;
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
      if (error || !data?.signedUrl) return null;
      return {
        path,
        name: file.name,
        url: data.signedUrl,
        createdAt: file.created_at || null,
        updatedAt: file.updated_at || null
      };
    })
  );

  return signedItems.filter(Boolean);
}

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  const admin = await verifyAdminFromEvent(event);
  if (!admin.ok) return admin.response;

  const { supabase } = admin;

  try {
    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    const body = JSON.parse(event.body || "{}");
    const action = body.action || "list";
    const userId = String(body.userId || "").trim();

    if (!userId) return json(400, { error: "User ID required" });

    if (action === "list") {
      const files = await createSignedFileList(supabase, userId);
      return json(200, { files });
    }

    if (action === "prepare_upload") {
      const files = Array.isArray(body.files) ? body.files : [];
      if (!files.length) return json(400, { error: "Files required" });

      const uploads = [];
      for (const file of files) {
        const safeName = String(file.name || "file").replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
        const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);
        if (error || !data?.token) throw error || new Error("Upload URL creation failed");
        uploads.push({ path, token: data.token });
      }

      return json(200, { uploads });
    }

    if (action === "delete") {
      const path = String(body.path || "").trim();
      if (!path) return json(400, { error: "Path required" });

      const { error } = await supabase.storage.from(BUCKET).remove([path]);
      if (error) return json(400, { error: error.message });

      return json(200, { success: true });
    }

    return json(400, { error: "Unknown action" });
  } catch (error) {
    return json(500, {
      error: "Server error",
      details: String(error?.message || error)
    });
  }
};
