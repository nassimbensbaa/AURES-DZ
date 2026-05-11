// ========== ملف api/send.js أو api/order.js ==========
// هذا الملف يعمل كـ Serverless Function على Vercel
// ضع هذا الملف في مجلد "api" داخل مشروعك

// ========== إعدادات تيليغرام ==========
// ⚠️ مهم: استخدم متغيرات البيئة في Vercel لحماية التوكن
// قم بإضافة المتغيرات التالية في إعدادات Vercel (Settings -> Environment Variables):
// - TELEGRAM_BOT_TOKEN: توكن البوت الخاص بك
// - TELEGRAM_CHAT_ID: معرف الشات أو القناة

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "YOUR_BOT_TOKEN_HERE";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "YOUR_CHAT_ID_HERE";

// ========== دالة تنسيق الرسالة ==========
function formatOrderMessage(orderData) {
    const deliveryTypeText = orderData.deliveryType === 'office' ? '📦 استلام من مكتب' : '🏠 توصيل للمنزل';
    const deliveryPrice = orderData.shipping.toLocaleString();
    const totalPrice = orderData.total.toLocaleString();
    const finalPrice = orderData.finalPrice.toLocaleString();
    
    return `
🛍️ *طلب جديد من متجر VIP*
━━━━━━━━━━━━━━━━━━

👤 *معلومات العميل:*
• الاسم: ${orderData.firstName} ${orderData.lastName}
• الهاتف: ${orderData.phone}
• الولاية: ${orderData.state}

📋 *تفاصيل الطلب:*
• المنتج: ${orderData.productName}
• سعر المنتج: ${finalPrice} دج
• طريقة التوصيل: ${deliveryTypeText}
• رسوم التوصيل: ${deliveryPrice} دج

💰 *المجموع النهائي: ${totalPrice} دج*

🕐 *تاريخ الطلب:* ${new Date(orderData.orderDate).toLocaleString('ar-DZ')}

━━━━━━━━━━━━━━━━━━
✅ *حالة الطلب:* قيد المراجعة
📞 *سيتم التواصل مع العميل خلال 24 ساعة*

#طلب_جديد #متجر_VIP
    `;
}

// ========== إرسال رسالة إلى تيليغرام ==========
async function sendToTelegram(message) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });
        
        const result = await response.json();
        
        if (result.ok) {
            return { success: true, message: 'تم إرسال الطلب إلى تيليغرام' };
        } else {
            return { success: false, error: result.description };
        }
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return { success: false, error: error.message };
    }
}

// ========== إرسال إشعار للمشتري (اختياري) ==========
async function sendConfirmationToCustomer(phone, orderData) {
    // يمكنك إضافة إرسال رسالة واتساب أو SMS هنا
    // هذه ميزة إضافية اختيارية
    console.log(`📱 سيتم إرسال تأكيد للعميل على رقم: ${phone}`);
    return true;
}

// ========== معالجة الطلب (الوظيفة الرئيسية) ==========
export default async function handler(req, res) {
    // إعدادات CORS للسماح بالطلبات
    const allowedOrigins = ['http://localhost:3000', 'https://your-domain.vercel.app'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // معالجة طلب OPTIONS (pre-flight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // التحقق من طريقة الطلب
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            ok: false, 
            error: 'الطريقة غير مدعومة. يرجى استخدام POST' 
        });
    }
    
    // التحقق من توكن البوت
    if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        console.error('❌ لم يتم إعداد توكن البوت بشكل صحيح');
        return res.status(500).json({ 
            ok: false, 
            error: 'لم يتم إعداد بوت تيليغرام. يرجى إضافة TELEGRAM_BOT_TOKEN في متغيرات البيئة' 
        });
    }
    
    if (!TELEGRAM_CHAT_ID || TELEGRAM_CHAT_ID === 'YOUR_CHAT_ID_HERE') {
        console.error('❌ لم يتم إعداد معرف الشات بشكل صحيح');
        return res.status(500).json({ 
            ok: false, 
            error: 'لم يتم إعداد معرف الشات. يرجى إضافة TELEGRAM_CHAT_ID في متغيرات البيئة' 
        });
    }
    
    try {
        // استلام البيانات من الطلب
        const orderData = req.body;
        
        // التحقق من البيانات المطلوبة
        if (!orderData.firstName || !orderData.phone || !orderData.state) {
            return res.status(400).json({ 
                ok: false, 
                error: 'بيانات ناقصة. يرجى التأكد من إدخال الاسم ورقم الهاتف والولاية' 
            });
        }
        
        console.log('📦 استلام طلب جديد:', {
            name: `${orderData.firstName} ${orderData.lastName}`,
            phone: orderData.phone,
            state: orderData.state,
            total: orderData.total
        });
        
        // تنسيق الرسالة
        const message = formatOrderMessage(orderData);
        
        // إرسال إلى تيليغرام
        const telegramResult = await sendToTelegram(message);
        
        if (telegramResult.success) {
            // إرسال تأكيد للعميل (اختياري)
            await sendConfirmationToCustomer(orderData.phone, orderData);
            
            // تسجيل الطلب في وحدة التحكم
            console.log('✅ تم إرسال الطلب بنجاح إلى تيليغرام');
            
            // حفظ الطلب في قاعدة بيانات بسيطة (اختياري - يمكنك استخدام Vercel KV أو MongoDB)
            // هنا نقوم بحفظه في الذاكرة المؤقتة للتوثيق فقط
            const orderLog = {
                ...orderData,
                receivedAt: new Date().toISOString(),
                status: 'sent_to_telegram'
            };
            
            // يمكنك إضافة حفظ في Vercel KV أو أي قاعدة بيانات أخرى
            // await saveToDatabase(orderLog);
            
            return res.status(200).json({ 
                ok: true, 
                message: 'تم استلام الطلب وإرساله إلى تيليغرام بنجاح',
                orderId: Date.now().toString()
            });
        } else {
            console.error('❌ فشل إرسال الطلب إلى تيليغرام:', telegramResult.error);
            return res.status(500).json({ 
                ok: false, 
                error: 'فشل إرسال الطلب إلى تيليغرام: ' + telegramResult.error 
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

// ========== دالة إضافية للحفظ المحلي (للتجربة) ==========
// يمكنك استخدام هذا للتجربة بدون قاعدة بيانات
const fs = require('fs');
const path = require('path');

function saveOrderLocally(orderData) {
    try {
        const ordersDir = path.join(process.cwd(), 'orders');
        if (!fs.existsSync(ordersDir)) {
            fs.mkdirSync(ordersDir, { recursive: true });
        }
        
        const fileName = `order_${Date.now()}.json`;
        const filePath = path.join(ordersDir, fileName);
        
        fs.writeFileSync(filePath, JSON.stringify(orderData, null, 2));
        console.log(`📁 تم حفظ الطلب محلياً في: ${filePath}`);
        return true;
    } catch (error) {
        console.error('❌ فشل حفظ الطلب محلياً:', error);
        return false;
    }
}