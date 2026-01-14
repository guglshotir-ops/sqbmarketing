import TelegramBot from 'node-telegram-bot-api';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import http from 'http';

// --- HEALTH CHECK SERVER (For Render/Heroku) ---
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('SQB Bot is running!');
});
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
    console.log(`Web server listening on port ${PORT}`);
});

// --- CONFIGURATION ---
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8436150781:AAHwVgNFgnrJO78Mg6yyroCQngx2T0e3k0Q';
// Using the Service Key (Admin) to allow unrestricted uploads and database writes
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhdG5obmV6a3h0aW9uemN1b3JrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI4NzgxOCwiZXhwIjoyMDgzODYzODE4fQ.AcbeQfwC_sOBV57UesDDZq6K9hdwoPW4XJQFKC_qLEc';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gatnhnezkxtionzcuork.supabase.co';

// Initialize
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('SQB Display Bot ishga tushdi! (Bot Started)');
console.log('Video yuborishni kutyapman...');

// --- BOT LOGIC ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Command: /start
    if (msg.text === '/start') {
        bot.sendMessage(chatId, '👋 Salom! Men SQB Display Botman.\n\n🎥 <b>VIDEO YUKLASH YO\'LLARI:</b>\n1. Kichik video (<20MB): Shunchaki Telegram orqali yuboring.\n2. Katta video (>20MB): Google Drive yoki to\'g\'ridan-to\'g\'ri havola (.mp4) yuboring.', { parse_mode: 'HTML' });
        return;
    }

    // --- HELPER: Progress Simulation ---
    const simulateLoading = (chatId, messageId, baseText) => {
        let dots = 0;
        return setInterval(() => {
            dots = (dots + 1) % 4;
            const text = `${baseText} ${'.'.repeat(dots)}`;
            bot.editMessageText(text, { chat_id: chatId, message_id: messageId }).catch(() => { });
        }, 3000); // Update every 3 seconds to avoid rate limits
    };

    // --- HANDLE URL (Google Drive or Direct Link) ---
    if (msg.text && (msg.text.startsWith('http') || msg.text.includes('drive.google.com'))) {
        const url = msg.text.trim();
        const statusMsg = await bot.sendMessage(chatId, '⏳ Havola qabul qilindi. Jarayon boshlanmoqda...');
        const statusMsgId = statusMsg.message_id;

        // Start "uploading_video" status in header
        bot.sendChatAction(chatId, 'upload_video');
        const actionInterval = setInterval(() => bot.sendChatAction(chatId, 'upload_video'), 4000);

        let loadingInterval = simulateLoading(chatId, statusMsgId, '⏬ Yuklanmoqda (Streaming Mode)');

        try {
            let downloadUrl = url;

            // Google Drive converter (View -> Download)
            if (url.includes('drive.google.com') && url.includes('/d/')) {
                const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
                if (fileIdMatch && fileIdMatch[1]) {
                    downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
                    console.log('Converted Drive URL:', downloadUrl);
                }
            }

            // STREAM DOWNLOAD
            // We do NOT download to RAM buffer. We pipe stream directly.
            const response = await axios({
                url: downloadUrl,
                method: 'GET',
                responseType: 'stream',
                timeout: 600000 // 10 minutes timeout for HUGE files
            });

            clearInterval(loadingInterval);
            await bot.editMessageText('☁️ Oqim orqali Supabase-ga uzatilyapti (Stream Upload)...', { chat_id: chatId, message_id: statusMsgId });
            loadingInterval = simulateLoading(chatId, statusMsgId, '☁️ Supabase-ga yozilmoqda');

            const fileName = `url_${Date.now()}.mp4`;

            // Upload using STREAM
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('videos')
                .upload(fileName, response.data, {
                    contentType: 'video/mp4',
                    upsert: false,
                    duplex: 'half' // Required for nodejs stream uploads
                });

            if (uploadError) throw new Error(uploadError.message);

            // Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('videos')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // Insert DB
            clearInterval(loadingInterval);
            await bot.editMessageText('💾 Bazaga yozilmoqda...', { chat_id: chatId, message_id: statusMsgId });

            const { error: dbError } = await supabase.from('videos').insert([{
                url: publicUrl,
                active: true,
                priority: 10,
                created_at: new Date().toISOString()
            }]);

            if (dbError) throw dbError;

            // Success
            clearInterval(actionInterval);
            await bot.editMessageText(`✅ <b>Muvaffaqiyatli!</b>\n\nVideo qo'shildi!`, { chat_id: chatId, message_id: statusMsgId, parse_mode: 'HTML' });

        } catch (error) {
            console.error('Link Error:', error);
            clearInterval(loadingInterval);
            clearInterval(actionInterval);
            bot.editMessageText(`❌ Xatolik: ${error.message}\n\n(Agar bu Google Drive bo'lsa, fayl "General Access: Anyone with the link" ekanligiga ishonch hosil qiling).`, { chat_id: chatId, message_id: statusMsgId });
        }
        return;
    }

    // --- HANDLE DIRECT FILE UPLOAD (Existing Logic) ---
    if (msg.video) {
        const video = msg.video;
        const fileId = video.file_id;

        bot.sendMessage(chatId, '⏳ Qabul qildim. Yuklab olinmoqda... (1/3)');

        try {
            // Get file link
            const fileLink = await bot.getFileLink(fileId);

            // Download as Stream
            const response = await axios({
                url: fileLink,
                method: 'GET',
                responseType: 'arraybuffer' // Keep buffer for small files (<20MB)
            });

            const fileBuffer = Buffer.from(response.data);
            const fileName = `vid_${Date.now()}.mp4`;

            bot.sendMessage(chatId, '☁️ Supabase Storage-ga yuklanmoqda... (2/3)');

            // Upload to Supabase
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('videos')
                .upload(fileName, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: false
                });

            if (uploadError) {
                if (uploadError.message.includes('The resource was not found')) {
                    throw new Error('Supabase Storage-da "videos" nomli bucket topilmadi. Iltimos, Supabase panelida yarating va Public qiling.');
                }
                throw new Error(uploadError.message);
            }

            // Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('videos')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // Save to DB
            bot.sendMessage(chatId, '💾 Bazaga ma\'lumot yozilmoqda... (3/3)');

            const { error: dbError } = await supabase
                .from('videos')
                .insert([
                    {
                        url: publicUrl,
                        active: true,
                        priority: 10, // High priority
                        created_at: new Date().toISOString()
                    }
                ]);

            if (dbError) throw dbError;

            bot.sendMessage(chatId, '✅ <b>Muvaffaqiyatli!</b>\n\nVideo qo\'shildi va navbatga qo\'yildi.', { parse_mode: 'HTML' });

        } catch (error) {
            console.error('Error:', error);
            bot.sendMessage(chatId, `❌ Xatolik yuz berdi:\n${error.message}`);
        }
    }
});
