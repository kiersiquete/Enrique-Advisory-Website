import { createAdminPdfBuffer, decodeSummaryReportPayload } from "../server/summary-report.js";

function readPayload(req) {
  const encoded = req.query?.data || new URL(req.url || "/", "http://localhost").searchParams.get("data");
  if (!encoded) {
    const error = new Error("Missing advisor report data");
    error.statusCode = 400;
    throw error;
  }
  return decodeSummaryReportPayload(encoded);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = readPayload(req);
    const pdf = createAdminPdfBuffer(payload);
    const safeName = String(payload.name || payload.participant?.name || "advisor-report")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="gilbert-devlyn-advisor-report-${safeName || "report"}.pdf"`);
    res.setHeader("Cache-Control", "private, max-age=0, no-store");
    return res.status(200).send(pdf);
  } catch (error) {
    const status = error.statusCode || 400;
    return res.status(status).json({ error: "Unable to create advisor report PDF" });
  }
}
