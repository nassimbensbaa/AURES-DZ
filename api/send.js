// api/send.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const TELEGRAM_TOKEN = "8654334809:AAGHZXjxwcDB0naVgJtYF0ZK2wuS-foI7C4";
        const TELEGRAM_CHAT_ID = "6765048627";

        const orderData = req.body;
        
        const message = `🌟 *طلب جديد* 🌟
━━━━━━━━━━━━━━━━━━━
👤 ${orderData.firstName} ${orderData.lastName}
📞 ${orderData.phone}
📍 ${orderData.state}
🚚 ${orderData.deliveryType === 'office' ? '📦 مكتب' : '🏠 منزل'}
💰 توصيل: ${orderData.shipping} دج
💎 المجموع: ${Math.round(orderData.total)} دج
━━━━━━━━━━━━━━━━━━━`;

        const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();

        if (result.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ success: false, error: result.description });
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}