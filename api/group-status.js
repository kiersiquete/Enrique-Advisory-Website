import { getGroupParticipantCount, MAX_GROUP_PARTICIPANTS } from "../server/airtable.js";
import { enforceRateLimit, prepareApiRequest } from "../server/http-security.js";
import { isValidOpaqueId } from "../server/validation.js";

export default async function handler(req, res) {
  if (!prepareApiRequest(req, res)) return;
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!enforceRateLimit(req, res, "group-status", { limit: 60, windowMs: 15 * 60 * 1000 })) {
    return;
  }

  const groupId = String(req.query?.group ?? "").trim().toLowerCase();
  if (!isValidOpaqueId(groupId)) {
    return res.status(400).json({ error: "Invalid comparison group key" });
  }

  try {
    const participantCount = await getGroupParticipantCount(groupId);
    return res.status(200).json({ ok: true, participantCount, maxParticipants: MAX_GROUP_PARTICIPANTS });
  } catch (error) {
    console.error("Group status lookup failed", error);
    return res.status(500).json({ error: "Unable to load group status" });
  }
}
