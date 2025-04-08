# MILKITA - SELFBOT DISCORD

Một selfbot Discord được phát triển bởi Nguyễn Thiên Phong (@phong2079) với sự hỗ trợ của AI, cung cấp nhiều tính năng hiện đại và tiện lợi.

## 🚀 Tính năng

### 📝 Quản lý ghi chú
- Thêm ghi chú: `;note <nội dung>`
- Xem danh sách: `;note notes`
- Xóa ghi chú: `;note delete <id>`
- Tự động lưu vào file JSON
- Hiển thị timestamp
- Tự động xóa tin nhắn sau 15 giây

### 🔄 Status
- Tự động thay đổi status discord presence
- Hỗ trợ nhiều loại status: playing, watching, listening, streaming
- Có thể cấu hình thời gian thay đổi
- Lưu cấu hình vào file JSON

### 📱 QR Code Banking
- Tạo mã QR từ văn bản
- Hỗ trợ nhiều loại mã QR
- Tùy chọn màu sắc và kích thước
- Lưu ảnh QR vào thư mục

### ⚙️ Cài đặt
- Thay đổi prefix: `;prefix <prefix mới>`
- Xem thời gian hoạt động: `;uptime`
- Kiểm tra ping: `;ping`
- Xem thông tin server: `;serverinfo`

### 🎮 Tiện ích
- Chế độ AFK: `;afk`
- Phân tích server: `;phantich`
- Tham gia Voice Channel: `;join <invite>`
- Xem avatar: `;avatar [@user]`
- Chat dạng typing...: `;typing <text>`
- Gửi lại tin nhắn: `;say <text>`

### 🔒 Bảo mật
- Xóa tin nhắn của bản thân: `;purge <số lượng>`
- Spam tin nhắn: `;spam <số lần> <text>`
- Spam tất cả kênh: `;spamallchannel <text>`

## 🛠️ Cài đặt

### Yêu cầu
- [Node.js](https://nodejs.org/en/download)

### Bước 1: Clone repository
```bash
git clone https://github.com/phongprovip1401/selfbot-discord.git
cd selfbot-discord
```

### Bước 2: Cài đặt dependencies
```bash
npm install
```

### Bước 3: Cấu hình
1. Sửa file `.env` và thêm token:
```
DISCORD_TOKEN=your_token_here
```

2. Hoặc sửa file `config.json`:
```json
{
    "token": "your_token_here",
    "prefix": ";"
}
```
Lưu ý: Có thể bỏ qua bước này nếu muốn nhập token trên cmd

### Bước 4: Chạy bot
```bash
node index.mjs
```

## ⚠️ Lưu ý
- Selfbot vi phạm điều khoản sử dụng của Discord
- Sử dụng có thể dẫn đến khóa tài khoản
- Chỉ sử dụng cho mục đích học tập và nghiên cứu
- Không sử dụng để phá hoại hoặc spam

## 📝 Logging
- Tự động log tin nhắn vào file
- Có thể bật/tắt hiển thị log trong console
- Log được lưu theo ngày trong thư mục `logs/`

## 🔄 Cập nhật
- Thường xuyên cập nhật tính năng mới
- Sửa lỗi và tối ưu hiệu suất
- Cải thiện bảo mật

## 📞 Nhà phát triển
- Author: Nguyễn Thiên Phong
- Discord: phong2079.
- GitHub: https://github.com/phong2079
- Social Media: [phong2079](https://guns.lol/phong2079)

## 📜 Giấy phép
MIT License - Xem file LICENSE để biết thêm chi tiết
