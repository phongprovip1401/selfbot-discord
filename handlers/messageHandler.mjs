import chalk from 'chalk';
import moment from 'moment';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, 'logs');
const LOG_FILE = path.join(LOG_DIR, `${moment().format('YYYY-MM-DD')}.log`);

// Tạo thư mục logs nếu chưa tồn tại
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
}

// Tạo writeStream với append mode
const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });

export function handleMessage(client) {
    client.on('messageCreate', async (message) => {
        // Bỏ qua tin nhắn của bot
        if (message.author.bot) return;

        const time = moment().format('HH:mm:ss');
        const guildName = message.guild ? message.guild.name : 'DM';
        const channelName = message.channel.name || 'Direct Message';
        const username = message.author.username;
        const text = message.content;

        // Tạo chuỗi log với màu sắc cho console
        const consoleLog = [
            chalk.gray(`[${time}]`),
            chalk.blue(`[${guildName}]`),
            chalk.green(`[${channelName}]`),
            chalk.yellow(`${username}:`),
            chalk.white(text)
        ].join(' ');

        // Tạo chuỗi log cho file (không có màu)
        const fileLog = `[${time}][${guildName}][${channelName}][${username}]: ${text}\n`;

        // Hiển thị lên console
        console.log(consoleLog);

        // Ghi vào file
        logStream.write(fileLog, (err) => {
            if (err) {
                console.error('Lỗi khi ghi log:', err);
            }
        });
    });
} 