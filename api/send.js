// api/send.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // قراءة المتغيرات من بيئة Vercel
        const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
        const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        // التحقق من وجود المتغيرات
        if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
            return res.status(500).json({ 
                success: false, 
                error: 'التوكنات غير موجودة في إعدادات Vercel' 
            });
        }

        const orderData = req.body;
        
        const message = `🌟 *طلب جديد* 🌟
━━━━━━━━━━━━━━━━━━━
👤 ${orderData.firstName} ${orderData.lastName}
📞 ${orderData.phone}
📍 ${orderData.state}
🚚 ${orderData.deliveryType === 'office' ? '📦 مكتب' : '🏠 منزل'}
💰 توصيل: ${orderData.shipping} دج
💎 المجموع: ${Math.round(orderData.total)} دج
━━━━━━━━━━━━━━━━━━━
🕐 ${new Date().toLocaleString('ar-DZ')}`;

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