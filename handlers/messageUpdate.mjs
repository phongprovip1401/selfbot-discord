import chalk from 'chalk';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../logs');

// Đảm bảo thư mục logs tồn tại
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export default function handleMessageUpdate(oldMessage, newMessage) {
    try {
        // Bỏ qua nếu không có thông tin tin nhắn
        if (!oldMessage || !newMessage) return;

        // Chỉ xử lý tin nhắn của người khác
        if (oldMessage.author && oldMessage.author.id !== oldMessage.client.user.id) {
            // Lấy thời gian hiện tại
            const now = moment();
            const time = now.format('HH:mm:ss');
            const date = now.format('YYYY-MM-DD');
            const logFile = path.join(LOGS_DIR, `${date}.txt`);

            // Format tin nhắn đã sửa
            const formattedMessage = `[${time}][${oldMessage.guild?.name || 'DM'}][${oldMessage.channel.name}][${oldMessage.author.username} (${oldMessage.author.id})]: [EDITED]\n> Old: ${oldMessage.content || 'No content'}\n> New: ${newMessage.content || 'No content'}`;

            // Ghi vào file log
            fs.appendFileSync(logFile, formattedMessage + '\n');
        }
    } catch (error) {
        console.error('Lỗi khi xử lý tin nhắn đã sửa:', error);
    }
} 