export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const CHAT_ID = process.env.CHAT_ID;

  const data = req.body;

  const text = `
🆕 طلب جديد:
👤 ${data.firstName} ${data.lastName}
📞 ${data.phone}
📍 ${data.state}
🚚 ${data.deliveryType}
💰 ${data.total} دج
`;

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text
    })
  });

  return res.status(200).json({ ok: true });
}