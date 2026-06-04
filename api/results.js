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

  const body = readBody(req);
  const entry = {
    createdAt: new Date().toISOString(),
    mode: body.mode,
    language: body.language,
    profile: body.profile,
    groupId: body.groupId,
    participantId: body.participantId,
    contactRequested: Boolean(body.contactRequested),
    overall: body.overall,
    stageId: body.stageId,
    pillarScores: body.pillarScores,
    transparency: body.transparency
  };

  console.log("Assessment result received", JSON.stringify(entry));

  return res.status(200).json({
    ok: true,
    persistence: "pending-airtable"
  });
}
