import { buildFollowUpMessage } from "../src/utils/messageGenerator.js";

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

export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const message = buildFollowUpMessage(readBody(req));
    return res.status(200).json({ message });
  } catch (error) {
    console.error("Unable to build follow-up message", error);
    return res.status(500).json({ error: "Unable to build follow-up message" });
  }
}
