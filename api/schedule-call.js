import { prepareApiRequest } from "../server/http-security.js";

export default async function handler(req, res) {
  if (!prepareApiRequest(req, res)) return;
  return res.status(410).json({ error: "Conversation requests must be explicitly confirmed by email" });
}
