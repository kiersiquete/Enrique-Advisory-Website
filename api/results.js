import {
  getComparisonGroupFromAirtable,
  persistAssessmentToAirtable
} from "../server/airtable.js";
import { sendComparisonReadyEmail, sendSummaryReportEmails } from "../server/email.js";
import { enforceRateLimit, prepareApiRequest } from "../server/http-security.js";
import {
  normalizeAssessmentSubmission,
  validateAssessmentSubmission
} from "../server/scoring.js";
import { publicBaseUrl } from "../server/url.js";
import { validationError } from "../server/validation.js";

function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      throw validationError("Request body must be valid JSON");
    }
  }
  return req.body;
}

export default async function handler(req, res) {
  if (!prepareApiRequest(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!enforceRateLimit(req, res, "assessment-results", { limit: 5, windowMs: 15 * 60 * 1000 })) {
    return;
  }

  try {
    const body = normalizeAssessmentSubmission(readBody(req));
    validateAssessmentSubmission(body);
    const result = await persistAssessmentToAirtable(body);
    let email;
    if (result.isNewSubmission) {
      try {
        email = await sendSummaryReportEmails(body, result, { baseUrl: requestBaseUrl(req) });
      } catch (emailError) {
        console.error("Summary email delivery failed", emailError);
        email = { sent: false, error: "summary-email-delivery-failed" };
      }
    } else {
      email = { sent: false, skipped: true, reason: "duplicate-submission" };
    }

    if (result.isNewSubmission && (result.groupStatus?.participantCount ?? 0) >= 2) {
      try {
        const advisorGroup = await getComparisonGroupFromAirtable(body.groupId);
        await sendComparisonReadyEmail(advisorGroup, {
          baseUrl: requestBaseUrl(req),
          language: body.language
        });
      } catch (comparisonError) {
        console.error("Comparison-ready email delivery failed", comparisonError);
      }
    }

    return res.status(200).json({
      ok: true,
      persistence: result.persistence,
      result: result.result,
      groupStatus: result.groupStatus,
      email: publicEmailStatus(email)
    });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      return res.status(400).json({ error: error.message });
    }

    console.error("Airtable persistence failed", error);
    return res.status(500).json({ error: "Unable to save assessment result" });
  }
}

function publicEmailStatus(email = {}) {
  return {
    sent: email.sent === true,
    skipped: email.skipped === true,
    ...(email.reason ? { reason: email.reason } : {}),
    ...(email.error ? { error: email.error } : {})
  };
}

function requestBaseUrl(req) {
  return publicBaseUrl(req, "https");
}
