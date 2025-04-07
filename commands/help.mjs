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
  const helpText = `**Danh sách lệnh: (prefix hiện tại: ${prefix})**

\`${prefix}join <link/tag/id voice>\` - Vào kênh voice (tự động rejoin khi bị kick)
\`${prefix}join\` - Out khỏi kênh voice nếu đang trong kênh

\`${prefix}avatar <id/tag>\` - Xem avatar của người dùng
\`${prefix}avatar @user\` - Xem avatar của người được tag

\`${prefix}boom <id/tag>\` - Spam chửi người dùng trong kênh hiện tại
\`${prefix}boom\` - Dừng spam chửi

\`${prefix}boom2 <id/tag>\` - Spam chửi người dùng random khắp các kênh
\`${prefix}boom2\` - Dừng spam chửi

\`${prefix}qr id <từ khóa>\` - Tìm kiếm ID ngân hàng (VD: ${prefix}qr id mb)
\`${prefix}qr edit <id bank> <số TK> <tên TK>\` - Thiết lập tài khoản ngân hàng
\`${prefix}qr bank <số tiền> [nội dung]\` - Tạo mã QR chuyển khoản

\`${prefix}purge <số lượng>\` - Xóa số lượng tin nhắn đã chỉ định của bạn

\`${prefix}ping\` - Kiểm tra độ trễ của bot
\`${prefix}uptime\` - Xem thời gian bot đã hoạt động
\`${prefix}serverinfo\` - Xem thông tin server
\`${prefix}say <text>\` - Bot sẽ nói lại text của bạn

*Note: Tất cả lệnh đều tự động xóa sau 15s (trừ lệnh qr bank)*

🎥 **Lệnh Play Video**
\`\`\`
;playvideo <channel> <url>
\`\`\`
**Mô tả:** Phát video trong kênh voice với chất lượng cao nhất có thể
**Tham số:**
- \`<channel>\`: ID hoặc link kênh voice
- \`<url>\`: Link video YouTube hoặc video trực tiếp

**Tính năng:**
- Tự động tải video YouTube với chất lượng cao nhất
- Hỗ trợ phát video 60fps với bitrate cao
- Tự động lưu cache video đã tải để phát lại nhanh hơn
- Thông báo trạng thái phát video chi tiết
- Tự động rời voice khi phát xong

**Lưu ý:**
- Cần cài đặt yt-dlp để phát video YouTube
- Video sẽ được phát với chất lượng cao nhất có thể
- Nếu không thể phát video YouTube, bot sẽ tự động chuyển sang video test`;

  const sent = await message.channel.send(helpText);
  setTimeout(() => sent.delete().catch(() => {}), 15000);
} 