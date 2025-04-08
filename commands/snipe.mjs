import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DELETED_MESSAGES_FILE = path.join(__dirname, '../deleted_messages.json');

// Đảm bảo file tồn tại
if (!fs.existsSync(DELETED_MESSAGES_FILE)) {
    fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify({}));
}

// Lưu tin nhắn đã xóa
export function addDeletedMessage(message) {
    try {
        const data = JSON.parse(fs.readFileSync(DELETED_MESSAGES_FILE));
        const channelId = message.channel.id;
        
        // Lấy thông tin ảnh nếu có
        const attachments = message.attachments.map(attachment => attachment.url);
        
        // Tạo đối tượng tin nhắn với thông tin ảnh
        const messageData = {
            content: message.content || 'No content',
            author: message.author.tag,
            authorId: message.author.id,
            timestamp: moment().format('YYYY-MM-DD HH:mm:ss'),
            attachments: attachments
        };

        // Lưu tin nhắn vào kênh tương ứng
        if (!data[channelId]) {
            data[channelId] = [];
        }
        data[channelId].unshift(messageData);

        // Giới hạn số lượng tin nhắn lưu trữ
        if (data[channelId].length > 10) {
            data[channelId] = data[channelId].slice(0, 10);
        }

        fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Lỗi khi lưu tin nhắn đã xóa:', error);
    }
}

// Xóa tin nhắn đã lưu
export function clearDeletedMessages(channelId) {
    try {
        const data = JSON.parse(fs.readFileSync(DELETED_MESSAGES_FILE));
        if (data[channelId]) {
            delete data[channelId];
            fs.writeFileSync(DELETED_MESSAGES_FILE, JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Lỗi khi xóa tin nhắn đã lưu:', error);
    }
}

// Lấy tin nhắn đã xóa
function getDeletedMessages(channelId) {
    try {
        const data = JSON.parse(fs.readFileSync(DELETED_MESSAGES_FILE));
        return data[channelId] || [];
    } catch (error) {
        console.error('Lỗi khi đọc tin nhắn đã xóa:', error);
        return [];
    }
}

// Export lệnh snipe
export const name = 'snipe';
export const permission = 'everyone';

export async function execute(message) {
    try {
        const messages = getDeletedMessages(message.channel.id);
        
        if (messages.length === 0) {
            const reply = await message.channel.send('Không tìm thấy tin nhắn nào đã xóa trong kênh này.');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 5000);
            return;
        }

        let response = '**Tin nhắn đã xóa gần đây:**\n';
        messages.forEach((msg, index) => {
            response += `\n**${index + 1}.** ${msg.author} - ${msg.timestamp}\n`;
            response += `> ${msg.content}`;
            
            // Thêm thông tin ảnh nếu có
            if (msg.attachments && msg.attachments.length > 0) {
                response += `\n> ${msg.attachments.join('\n> ')}`;
            }
        });

        const reply = await message.channel.send(response);
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 30000);
    } catch (error) {
        console.error('Lỗi khi thực thi lệnh snipe:', error);
        const reply = await message.channel.send('Đã xảy ra lỗi khi xử lý lệnh.');
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
    }
} 