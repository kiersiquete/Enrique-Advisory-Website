import { persistAssessmentToAirtable } from "../server/airtable.js";

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = readBody(req);

  try {
    const result = await persistAssessmentToAirtable(body);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Airtable persistence failed", error);
    return res.status(500).json({ error: "Unable to save assessment result" });
  }
}
