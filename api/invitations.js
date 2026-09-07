import { prepareApiRequest } from "../server/http-security.js";

export default async function handler(req, res) {
  if (!prepareApiRequest(req, res)) return;
  return res.status(410).json({ error: "Email invitations are created in your own email app" });
}
