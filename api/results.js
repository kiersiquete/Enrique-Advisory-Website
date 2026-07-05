import { persistAssessmentToAirtable } from "../server/airtable.js";
import { sendSummaryReportEmails } from "../server/email.js";
import { normalizeAssessmentSubmission } from "../server/scoring.js";

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

  const body = normalizeAssessmentSubmission(readBody(req));

  try {
    const result = await persistAssessmentToAirtable(body);
    let email;
    if (body.reportRequest?.status === "requested") {
      try {
        email = await sendSummaryReportEmails(body, result, { baseUrl: requestBaseUrl(req) });
      } catch (emailError) {
        console.error("Summary email delivery failed", emailError);
        email = { sent: false, error: "summary-email-delivery-failed" };
      }
    } else {
      email = { sent: false, skipped: true };
    }
    return res.status(200).json({ ...result, email });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Airtable persistence failed", error);
    return res.status(500).json({ error: "Unable to save assessment result" });
  }
}

function requestBaseUrl(req) {
  if (process.env.PUBLIC_SITE_URL) return process.env.PUBLIC_SITE_URL.replace(/\/$/, "");
  const headers = req.headers || {};
  const protocol = headers["x-forwarded-proto"] || "https";
  const host = headers["x-forwarded-host"] || headers.host;
  return host ? `${protocol}://${host}` : "";
}
