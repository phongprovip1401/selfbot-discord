import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../config.json');

function getPrefix() {
  if (existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      return config.prefix || ';';
    } catch (err) {
      console.error('Lỗi khi đọc prefix từ config:', err);
      return ';';
    }
  }
  return ';';
}

export const name = 'help';
export const permission = 'everyone';

export async function execute(message) {
    const prefix = message.client.prefix || ';';
    const helpMessage = `
**📋 Danh sách lệnh:**

**📝 Ghi chú:**
\`${prefix}note <nội dung>\` - Thêm ghi chú mới
\`${prefix}notes\` - Xem danh sách ghi chú
\`${prefix}note delete <id>\` - Xóa ghi chú theo ID

**📊 Thống kê:**
\`${prefix}stats\` - Xem thống kê server
\`${prefix}stats user\` - Xem thống kê người dùng
\`${prefix}stats channel\` - Xem thống kê kênh

**🔄 Trạng thái:**
\`${prefix}status\` - Xem trạng thái hiện tại
\`${prefix}status add <nội dung>\` - Thêm trạng thái mới
\`${prefix}status delete <id>\` - Xóa trạng thái theo ID
\`${prefix}status clear\` - Xóa tất cả trạng thái

**📱 QR Code:**
\`${prefix}qr\` - Xem danh sách tài khoản ngân hàng
\`${prefix}qr add <bank> <stk> <name>\` - Thêm tài khoản ngân hàng
\`${prefix}qr delete <id>\` - Xóa tài khoản theo ID
\`${prefix}qr clear\` - Xóa tất cả tài khoản

**🔍 Tin nhắn:**
\`${prefix}snipe\` - Xem tin nhắn đã xóa gần đây
\`${prefix}afk <lý do>\` - Bật chế độ AFK
\`${prefix}afk off\` - Tắt chế độ AFK

**⚙️ Cài đặt:**
\`${prefix}prefix <prefix mới>\` - Đổi prefix
\`${prefix}help\` - Xem danh sách lệnh
`;

    const reply = await message.channel.send(helpMessage);
    setTimeout(() => {
        message.delete().catch(() => {});
        reply.delete().catch(() => {});
    }, 15000);
} 