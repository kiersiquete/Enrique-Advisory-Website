import { getComparisonGroupFromAirtable } from "../server/airtable.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const groupId = String(req.query?.group ?? "").trim();
  if (!groupId) {
    return res.status(400).json({ error: "Missing group key" });
  }

  try {
    const group = await getComparisonGroupFromAirtable(groupId);
    return res.status(200).json({ ok: true, group });
  } catch (error) {
    console.error("Airtable group lookup failed", error);
    return res.status(500).json({ error: "Unable to load comparison group" });
  }
}
