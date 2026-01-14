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

console.log('🤖 SQB Display Bot ishga tushdi! (Bot Started)');
console.log('Video yuborishni kutyapman...');

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const adminUsername = msg.chat.username;

    // Optional: Log who is using the bot
    console.log(`Message from ${adminUsername} (${chatId}): ${msg.text || '[Media]'}`);

    // Command: /start
    if (msg.text === '/start') {
        bot.sendMessage(chatId, '👋 Salom! Men SQB Display Botman.\n\n🎥 <b>VIDEO YUKLASH YO\'LLARI:</b>\n1. Kichik video (<20MB): Shunchaki Telegram orqali yuboring.\n2. Katta video (>20MB): Google Drive yoki to\'g\'ridan-to\'g\'ri havola (.mp4) yuboring.', { parse_mode: 'HTML' });
        return;
    }

    // --- HANDLE URL (Google Drive or Direct Link) ---
    if (msg.text && (msg.text.startsWith('http') || msg.text.includes('drive.google.com'))) {
        const url = msg.text.trim();
        bot.sendMessage(chatId, '🔗 Havola qabul qilindi. Yuklashga harakat qilyapman... (1/3)');

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

            // Download stream
            const response = await axios({
                url: downloadUrl,
                method: 'GET',
                responseType: 'arraybuffer', // Buffer for upload
                maxContentLength: 100 * 1024 * 1024, // Limit download to 100MB to save RAM/Time
                timeout: 60000 // 60 sec timeout
            });

            const fileBuffer = Buffer.from(response.data);
            const fileName = `url_${Date.now()}.mp4`; // Generic name, assuming MP4

            bot.sendMessage(chatId, '☁️ Video yuklab olindi. Supabase-ga o\'tkazyapman... (2/3)');

            // Upload using existing logic
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('videos')
                .upload(fileName, fileBuffer, {
                    contentType: 'video/mp4',
                    upsert: false
                });

            if (uploadError) throw new Error(uploadError.message);

            // Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('videos')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // Insert DB
            bot.sendMessage(chatId, '💾 Bazaga yozilmoqda... (3/3)');
            const { error: dbError } = await supabase.from('videos').insert([{
                url: publicUrl,
                active: true,
                priority: 10,
                created_at: new Date().toISOString()
            }]);

            if (dbError) throw dbError;

            bot.sendMessage(chatId, `✅ <b>Link orqali yuklandi!</b>\n\nVideo qo'shildi!`, { parse_mode: 'HTML' });

        } catch (error) {
            console.error('Link Error:', error);
            bot.sendMessage(chatId, `❌ Xatolik: ${error.message}\n\n(Agar bu Google Drive bo'lsa, fayl "General Access: Anyone with the link" ekanligiga ishonch hosil qiling).`);
        }
        return;
    }

    // --- HANDLE DIRECT FILE UPLOAD (Existing Logic) ---
    if (msg.video) {
        const video = msg.video;
        const fileId = video.file_id;
        // Generate a clean filename
        const timestamp = Date.now();
        const originalName = video.file_name || 'video_upload';
        // Sanitize filename to avoid path issues
        const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '_');
        const fileName = `tg_${timestamp}_${safeName}.mp4`;

        bot.sendMessage(chatId, '⏳ Qabul qildim. Yuklab olinmoqda... (1/3)');

        try {
            // 1. Get direct download link from Telegram
            const fileLink = await bot.getFileLink(fileId);

            // 2. Download file as buffer
            const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
            const fileBuffer = Buffer.from(response.data);

            bot.sendMessage(chatId, '☁️ Supabase Storage-ga yuklanmoqda... (2/3)');

            // 3. Upload to Supabase 'videos' bucket
            // Ensure you have created a public bucket named 'videos' in Supabase Storage!
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('videos')
                .upload(fileName, fileBuffer, {
                    contentType: video.mime_type || 'video/mp4',
                    upsert: false
                });

            if (uploadError) {
                console.error('Storage Error:', uploadError);
                if (uploadError.message.includes('not found') || uploadError.statusCode === '404') {
                    throw new Error('Supabase Storage-da "videos" nomli bucket topilmadi. Iltimos, Supabase panelida yarating va Public qiling.');
                }
                throw new Error(uploadError.message);
            }

            // 4. Get Public URL
            const { data: publicUrlData } = supabase
                .storage
                .from('videos')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;
            console.log('File uploaded:', publicUrl);

            // 5. Insert record into Database 'videos' table
            bot.sendMessage(chatId, '💾 Bazaga yozilmoqda... (3/3)');

            const { error: dbError } = await supabase
                .from('videos')
                .insert([
                    {
                        url: publicUrl,
                        active: true,
                        priority: 10,   // High priority for instant playback
                        created_at: new Date().toISOString(),
                        // start_time and end_time can be left null for immediate permanent playback
                    }
                ]);

            if (dbError) {
                console.error('Database Error:', dbError);
                throw new Error('Bazaga yozishda xatolik: ' + dbError.message);
            }

            bot.sendMessage(chatId, `✅ <b>Muvaffaqiyatli!</b>\n\nVideo yuklandi va bazaga qo'shildi.\nNavbatdagi siklda ekranda paydo bo'ladi!\n\n🔗 ${publicUrl}`, { parse_mode: 'HTML' });

        } catch (error) {
            console.error('Bot Error:', error);
            bot.sendMessage(chatId, `❌ <b>Xatolik yuz berdi:</b>\n${error.message}`, { parse_mode: 'HTML' });
        }
    } else if (msg.document && msg.document.mime_type?.startsWith('video')) {
        // Handle video sent as document
        bot.sendMessage(chatId, '⚠️ Iltimos, videoni fayl sifatida emas, "Video" formatida yuboring (siqilgan holda), bu tezroq ishlaydi.');
    } else if (!msg.text?.startsWith('/')) {
        bot.sendMessage(chatId, '🎥 Iltimos, faqat video fayl yuboring.');
    }
});
