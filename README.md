
# 🌟 MILKITA - Discord Selfbot

> Một selfbot hiện đại dành cho Discord, phát triển bởi [@phong2079](https://github.com/phongprovip1401) với sự hỗ trợ của AI.  
> Hỗ trợ nhiều tính năng tiện lợi, giao diện thân thiện và dễ sử dụng.

---

## 🚀 Tính Năng Chính

### 📝 Ghi chú cá nhân
- ➕ Thêm ghi chú: `;note <nội dung>`
- 📄 Xem danh sách: `;note list`
- ❌ Xoá ghi chú: `;note delete <id>`
- 🕒 Tự lưu kèm timestamp
- ⏳ Tự xoá tin nhắn sau 15s

---

### 🔄 Trạng thái Discord
- 🎮 Tùy chỉnh status: playing, watching, listening, streaming
- ⏱️ Cấu hình thời gian hoạt động
- 💾 Lưu cấu hình vào file JSON
- ⚙️ Cú pháp linh hoạt với `;status edit <key> <giá trị>`

---

### 📱 QR Code Banking
- 🧾 Tạo mã QR chuyển khoản từ nội dung và số tiền
- 🏦 Lưu & quản lý nhiều ngân hàng
- 🎨 Tuỳ chỉnh màu sắc, kích thước mã QR
- 💾 Lưu ảnh QR về máy

---

### ⚙️ Hệ thống & Tiện ích
- 🔧 Đổi prefix: `;prefix <ký tự>`
- 📶 Ping: `;ping`
- 🕓 Uptime: `;uptime`
- 📑 Thông tin server: `;serverinfo`
- 🧠 Phân tích quyền server: `;phantich`

---

### 🎮 Tiện ích người dùng
- 💤 AFK: `;afk`
- 🖼️ Avatar/Banner: `;avatar`, `;banner`
- 💬 Chat dạng đang gõ: `;typing`
- 🔁 Gửi lại nội dung: `;say`
- 🔊 Treo voice channel: `;join <channel/link>`

---

### 🔒 Bảo mật & Tin nhắn
- 🧹 Xoá tin nhắn bản thân: `;purge <số lượng>`
- 🔁 Spam 1 kênh: `;spam <số lần> <delay> <nội dung>`
- 🌐 Spam toàn bộ kênh có quyền: `;spamallchannel <nội dung>`
- 🔍 Xem tin nhắn đã bị xoá: `;snipe`

---

## 📦 Cài Đặt

### ⚙️ Yêu cầu
- Node.js (>= 20.18.0): [Tải tại đây](https://nodejs.org/en/download)

### 🔧 Hướng dẫn cài đặt

```bash
git clone https://github.com/phongprovip1401/selfbot-discord.git
cd selfbot-discord
npm install
```

### 🔐 Cấu hình token

#### Cách 1: `.env`
```
DISCORD_TOKEN=your_token_here
```

#### Cách 2: `config.json`
```json
{
  "token": "your_token_here",
  "prefix": ";"
}
```

> 💡 Nếu không có, bạn cũng có thể nhập trực tiếp token từ dòng lệnh.

### ▶️ Chạy selfbot
```bash
node index.mjs
```

---

## 📝 Logging
- 📁 Tự động log tin nhắn vào thư mục `logs/`
- 🗓️ Log được chia theo ngày
- 🔎 Tuỳ chọn bật/tắt log console

---

## ⚠️ Cảnh Báo
> ❗ Selfbot vi phạm [Điều khoản dịch vụ của Discord](https://discord.com/terms)  
> ➤ **Sử dụng selfbot có thể dẫn đến việc khoá tài khoản.**  
> ✅ Chỉ sử dụng cho mục đích **học tập**, **cá nhân** và **phi thương mại**

---

## 🔄 Cập Nhật
- ✨ Thêm tính năng định kỳ
- 🛠️ Sửa lỗi nhanh chóng
- 🔐 Tăng cường bảo mật & hiệu suất

---

## 👤 Tác Giả

- **Nguyễn Thiên Phong**
  - Discord: `phong2079.`
  - GitHub: [github.com/phongprovip1401](https://github.com/phongprovip1401)
  - Socials: [thienphong.site](https:/thienphong.site)

---

## 📜 Giấy Phép
Distributed under the [MIT License](./LICENSE).
