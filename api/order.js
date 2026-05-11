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
        message: "Missing BOT_TOKEN or CHAT_ID"
      });
    }

    const data = req.body;

    const text = `
🆕 طلب جديد:
👤 الاسم: ${data.firstName} ${data.lastName}
📞 الهاتف: ${data.phone}
📍 الولاية: ${data.state}
🚚 التوصيل: ${data.deliveryType}
💰 المنتج: ${data.productName}
💵 الإجمالي: ${data.total} دج
`;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
        }),
      }
    );

    const result = await telegramRes.json();

    return res.status(200).json({
      ok: result.ok,
      telegram: result,
    });

  } catch (err) {
    console.error("Telegram Error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}