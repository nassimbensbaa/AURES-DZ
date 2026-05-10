// api/send.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const TELEGRAM_TOKEN = "7306506473:AAHtpkFmLX6h-xxjLQqS_N3hGSdXAfZnHyE";
        const TELEGRAM_CHAT_ID = "7306506473";

        const orderData = req.body;
        
        const message = `
🌟 *طلب جديد من المتجر* 🌟
━━━━━━━━━━━━━━━━━━━
👤 *العميل:* ${orderData.firstName} ${orderData.lastName}
📞 *الهاتف:* ${orderData.phone}
📍 *الولاية:* ${orderData.state}
🚚 *التوصيل:* ${orderData.deliveryType === 'office' ? '📦 مكتب' : '🏠 منزل'}
💰 *سعر التوصيل:* ${orderData.shipping} دج
💎 *المجموع:* ${Math.round(orderData.total)} دج
━━━━━━━━━━━━━━━━━━━
        `;

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