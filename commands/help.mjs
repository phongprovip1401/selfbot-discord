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

export async function execute(message, args) {
  const prefix = getPrefix();
  const helpText = `
\`\`\`
📝 Danh sách lệnh:

1. ${prefix}help - Hiển thị danh sách lệnh
2. ${prefix}ping - Kiểm tra độ trễ
3. ${prefix}uptime - Xem thời gian hoạt động
4. ${prefix}avatar - Xem avatar của bạn
5. ${prefix}serverinfo - Xem thông tin server
6. ${prefix}status - Quản lý trạng thái
7. ${prefix}typing - Bật/tắt chế độ đang gõ
8. ${prefix}purge <số> - Xóa tin nhắn
9. ${prefix}spam <số> <tin nhắn> - Spam tin nhắn
10. ${prefix}say <tin nhắn> - Gửi tin nhắn
11. ${prefix}phantich - Phân tích tin nhắn
12. ${prefix}qr - Quản lý QR code
13. ${prefix}join - Tham gia voice channel
14. ${prefix}afk - Bật/tắt chế độ AFK

📌 Quản lý ghi chú:
15. ${prefix}note <nội dung> - Thêm ghi chú mới
16. ${prefix}notes - Xem danh sách ghi chú
17. ${prefix}note delete <id> - Xóa ghi chú

💡 Lưu ý: Tất cả tin nhắn sẽ tự động xóa sau 5 giây
\`\`\`
`;

  const reply = await message.channel.send(helpText);
  setTimeout(() => {
    message.delete().catch(() => {});
    reply.delete().catch(() => {});
  }, 30000);
} 