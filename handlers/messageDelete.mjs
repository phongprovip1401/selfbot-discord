import chalk from 'chalk';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { addDeletedMessage } from '../commands/snipe.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.join(__dirname, '../logs');

// Đảm bảo thư mục logs tồn tại
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

export default function handleMessageDelete(message) {
    try {
        // Bỏ qua nếu không có thông tin tin nhắn
        if (!message) return;

        // Chỉ xử lý tin nhắn của người khác
        if (message.author && message.author.id !== message.client.user.id) {
            // Lưu tin nhắn cho lệnh snipe
            addDeletedMessage(message);

            // Lấy thời gian hiện tại
            const now = moment();
            const time = now.format('HH:mm:ss');
            const date = now.format('YYYY-MM-DD');
            const logFile = path.join(LOGS_DIR, `${date}.txt`);

            // Format tin nhắn đã xóa
            const formattedMessage = `[${time}][${message.guild?.name || 'DM'}][${message.channel.name}][${message.author.username} (${message.author.id})]: [DELETED] ${message.content || 'No content'}`;

            // Ghi vào file log
            fs.appendFileSync(logFile, formattedMessage + '\n');

            // Hiển thị trong console nếu được bật
            if (process.env.SHOW_MESSAGE_HANDLER === 'true') {
                console.log(chalk.red(formattedMessage));
            }
        }
    } catch (error) {
        console.error('Lỗi khi xử lý tin nhắn đã xóa:', error);
    }
} 