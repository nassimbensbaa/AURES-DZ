// ========== api/send-order.js ==========
// هذا الملف يعمل كـ Serverless Function على Vercel
// يستقبل الطلبات من الموقع ويرسلها إلى تيليغرام

export default async function handler(req, res) {
    // إعدادات CORS للسماح بالطلبات من أي مصدر
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
            error: 'الطريقة غير مدعومة. يرجى استخدام POST' 
        });
    }
    
    try {
        // استلام البيانات من الطلب
        const orderData = req.body;
        
        // التحقق من وجود البيانات المطلوبة
        if (!orderData.firstName || !orderData.phone || !orderData.state) {
            return res.status(400).json({ 
                ok: false, 
                error: 'بيانات ناقصة. يرجى التأكد من إدخال الاسم ورقم الهاتف والولاية' 
            });
        }
        
        // جلب التوكن ومعرف الشات من متغيرات البيئة (آمن)
        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
        
        // التحقق من وجود متغيرات البيئة
        if (!BOT_TOKEN || BOT_TOKEN === '') {
            console.error('❌ TELEGRAM_BOT_TOKEN غير مضبوط في متغيرات البيئة');
            return res.status(500).json({ 
                ok: false, 
                error: 'الرجاء إعداد بوت تيليغرام أولاً. قم بإضافة TELEGRAM_BOT_TOKEN في إعدادات Vercel' 
            });
        }
        
        if (!CHAT_ID || CHAT_ID === '') {
            console.error('❌ TELEGRAM_CHAT_ID غير مضبوط في متغيرات البيئة');
            return res.status(500).json({ 
                ok: false, 
                error: 'الرجاء إعداد معرف الشات أولاً. قم بإضافة TELEGRAM_CHAT_ID في إعدادات Vercel' 
            });
        }
        
        // تحديد نوع التوصيل
        const deliveryTypeText = orderData.deliveryType === 'office' ? '📦 استلام من مكتب' : '🏠 توصيل للمنزل';
        
        // تنسيق التاريخ والوقت
        const now = new Date();
        const formattedDate = `${now.toLocaleDateString('ar-DZ')} - ${now.toLocaleTimeString('ar-DZ')}`;
        
        // تنسيق الرسالة بشكل جميل
        const message = `🛍️ *طلب جديد من متجر VIP*
━━━━━━━━━━━━━━━━━━━━━━━━

👤 *معلومات العميل:*
• الاسم: ${orderData.firstName} ${orderData.lastName || ''}
• رقم الهاتف: ${orderData.phone}
• الولاية: ${orderData.state}

📋 *تفاصيل الطلب:*
• المنتج: ${orderData.productName}
• سعر المنتج: ${orderData.finalPrice.toLocaleString()} دج
• طريقة التوصيل: ${deliveryTypeText}
• رسوم التوصيل: ${orderData.shipping.toLocaleString()} دج

💰 *المجموع النهائي:*
• ${orderData.total.toLocaleString()} دج

🕐 *تاريخ الطلب:* ${formattedDate}

━━━━━━━━━━━━━━━━━━━━━━━━
✅ *حالة الطلب:* قيد المراجعة
📞 *سيتم التواصل مع العميل خلال 24 ساعة*

#طلب_جديد #متجر_VIP #الجزائر`;
        
        // إرسال إلى API تيليغرام
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ تم إرسال الطلب إلى تيليغرام بنجاح');
            return res.status(200).json({ 
                ok: true, 
                message: 'تم استلام الطلب وإرساله إلى تيليغرام',
                orderId: Date.now().toString()
            });
        } else {
            console.error('❌ فشل إرسال الطلب إلى تيليغرام:', result.description);
            return res.status(500).json({ 
                ok: false, 
                error: result.description || 'فشل إرسال الطلب إلى تيليغرام'
            });
        }
        
    } catch (error) {
        console.error('❌ خطأ في معالجة الطلب:', error);
        return res.status(500).json({ 
            ok: false, 
            error: 'حدث خطأ داخلي في الخادم: ' + error.message 
        });
    }
}