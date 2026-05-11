// ========== api/send.js ==========
// هذا الملف يتعامل مع إرسال الطلبات إلى تيليغرام

export default async function handler(req, res) {
    // إعدادات CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // معالجة طلب OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // التأكد من أن الطلب من نوع POST
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            ok: false, 
            message: 'الطريقة غير مدعومة. يرجى استخدام POST' 
        });
    }
    
    try {
        // استلام البيانات من الطلب
        const orderData = req.body;
        
        // التحقق من البيانات المطلوبة
        if (!orderData.firstName || !orderData.phone || !orderData.state) {
            return res.status(400).json({ 
                ok: false, 
                message: 'بيانات ناقصة. يرجى التأكد من إدخال الاسم ورقم الهاتف والولاية' 
            });
        }
        
        // ========== توكن البوت ومعرف الشات ==========
        const BOT_TOKEN = "7306506473:AAHtpkFmLX6h-xxjLQqS_N3hGSdXAfZnHyE";
        const CHAT_ID = "7306506473";
        
        // تنسيق نوع التوصيل
        const deliveryTypeText = orderData.deliveryType === 'office' ? '📦 استلام من مكتب' : '🏠 توصيل للمنزل';
        
        // تنسيق التاريخ والوقت
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString('ar-DZ')} - ${now.toLocaleTimeString('ar-DZ')}`;
        
        // تنسيق الرسالة بشكل جميل
        const message = `🌟 طلب جديد من متجر VIP 🌟
━━━━━━━━━━━━━━━━━━━━━━━━
👤 العميل: ${orderData.firstName} ${orderData.lastName || ''}
📞 الهاتف: ${orderData.phone}
📍 الولاية: ${orderData.state}
🚚 التوصيل: ${deliveryTypeText}
💰 سعر المنتج: ${orderData.finalPrice.toLocaleString()} دج
🚛 رسوم التوصيل: ${orderData.shipping.toLocaleString()} دج
💎 المجموع الكلي: ${Math.round(orderData.total).toLocaleString()} دج
━━━━━━━━━━━━━━━━━━━━━━━━
🛍️ المنتج: ${orderData.productName}
📅 التاريخ: ${formattedDate}
━━━━━━━━━━━━━━━━━━━━━━━━
✅ تم استلام الطلب بنجاح
📞 سيتم التواصل معكم خلال 24 ساعة

#طلب_جديد #متجر_VIP`;
        
        // إرسال إلى تيليغرام باستخدام طريقة GET (نفس الطريقة التي تعمل)
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
        
        const response = await fetch(url);
        const result = await response.json();
        
        console.log('رد تيليغرام:', result);
        
        if (result.ok) {
            return res.status(200).json({ 
                ok: true, 
                message: 'تم إرسال الطلب بنجاح',
                orderId: Date.now().toString()
            });
        } else {
            return res.status(500).json({ 
                ok: false, 
                message: result.description || 'فشل إرسال الطلب إلى تيليغرام'
            });
        }
        
    } catch (error) {
        console.error('خطأ في معالجة الطلب:', error);
        return res.status(500).json({ 
            ok: false, 
            message: 'حدث خطأ داخلي في الخادم: ' + error.message 
        });
    }
}