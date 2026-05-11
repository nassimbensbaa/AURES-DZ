export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Only POST allowed" });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      return res.status(500).json({
        ok: false,
        message: "BOT_TOKEN or CHAT_ID missing in environment variables"
      });
    }

    const data = req.body;

    const message = `
🆕 طلب جديد:
👤 الاسم: ${data.firstName || ""} ${data.lastName || ""}
📞 الهاتف: ${data.phone || ""}
📍 الولاية: ${data.wilaya || data.state || ""}
🚚 التوصيل: ${data.delivery || data.deliveryType || ""}
💰 السعر: ${data.total || 0} دج
📦 المنتج: ${data.productName || "غير محدد"}
`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const telegramRes = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
      }),
    });

    const result = await telegramRes.json();

    console.log("TELEGRAM RESPONSE:", result);

    if (!result.ok) {
      return res.status(500).json({
        ok: false,
        message: "Telegram API error",
        result
      });
    }

    return res.status(200).json({
      ok: true,
      result
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: error.message
    });
  }
}