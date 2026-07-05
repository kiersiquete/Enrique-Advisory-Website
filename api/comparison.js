import { getComparisonGroupFromAirtable } from "../server/airtable.js";
import { decodeActionToken } from "../server/summary-report.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = decodeActionToken(req.query?.data);
    const language = payload.language === "es" ? "es" : "en";
    const group = await getComparisonGroupFromAirtable(payload.groupId);
    return res.status(200).json({ ok: true, group, language });
  } catch (error) {
    return res.status(400).json({ error: "Unable to load this comparison link" });
  }
}
