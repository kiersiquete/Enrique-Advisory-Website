import { renderScheduleCallConfirmationPage, sendCallRequestNotification } from "../server/email.js";
import { decodeActionToken } from "../server/summary-report.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let language = "en";
  try {
    const payload = decodeActionToken(req.query.data);
    language = payload.language === "es" ? "es" : "en";

    try {
      await sendCallRequestNotification({
        name: payload.name,
        email: payload.email,
        language
      });
    } catch (notifyError) {
      console.error("Schedule-call notification failed", notifyError);
    }

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(renderScheduleCallConfirmationPage(language, true));
  } catch (error) {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(400).send(renderScheduleCallConfirmationPage(language, false));
  }
}
