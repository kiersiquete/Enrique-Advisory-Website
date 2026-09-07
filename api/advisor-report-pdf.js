import { prepareApiRequest } from "../server/http-security.js";

export default async function handler(req, res) {
  if (!prepareApiRequest(req, res)) return;
  return res.status(404).json({ error: "Not found" });
}
