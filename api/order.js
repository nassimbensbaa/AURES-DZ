export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Only POST allowed" });
  }

  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const CHAT_ID = process.env.CHAT_ID;

    const { firstName, lastName, phone, state, deliveryType, shipping, total, productName } = req.body;

    const message = `
🌟 طلب جديد من المتجر 🌟
━━━━━━━━━━━━━━
👤 الاسم: ${firstName} ${lastName}
📞 الهاتف: ${phone}
📍 الولاية: ${state}
🚚 التوصيل: ${deliveryType === "home" ? "منزل" : "مكتب"}
💰 التوصيل: ${shipping} دج
💎 المجموع: ${Math.round(total)} دج
🛍️ المنتج: ${productName}
━━━━━━━━━━━━━━
`;

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    const telegramRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message
      })
    });

    const data = await telegramRes.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}