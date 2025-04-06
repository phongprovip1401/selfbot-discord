import { writeFileSync, readFileSync, existsSync } from 'fs';  // Import fs module

export const name = 'afk';
export const permission = 'everyone';

let afkStatus = false;  // Trạng thái AFK mặc định là "off"
let afkMessages = [];   // Mảng lưu tin nhắn của người đã tag bạn khi AFK

// Đọc lại thông tin từ file nếu có
if (existsSync('./afkMessages.json')) {
  try {
    afkMessages = JSON.parse(readFileSync('./afkMessages.json', 'utf-8'));
  } catch (err) {
    console.error('Lỗi khi đọc file afkMessages.json:', err);
    afkMessages = [];  // Nếu có lỗi khi đọc file, khởi tạo lại mảng rỗng
  }
}

export async function execute(message) {
  const user = message.author;

  // Kiểm tra trạng thái AFK
  if (afkStatus) {
    // AFK is ON => chuyển về OFF và báo cáo tin nhắn
    afkStatus = false;
    const report = afkMessages.map((msg, index) => 
      `>>> ${index + 1}. ${msg.user} [${msg.timestamp}] [${msg.guildName || 'N/A'}] [${msg.channelName || 'N/A'}] (${msg.link})`).join('\n');
    afkMessages = []; // Xóa danh sách sau khi báo cáo
    writeFileSync('./afkMessages.json', JSON.stringify(afkMessages)); // Cập nhật lại file

    // Gửi báo cáo và xóa sau 15s
    const sentMessage = await message.channel.send(`Welcome back, nhung ng da tag luc afk:\n${report}`);
    setTimeout(() => sentMessage.delete(), 15000);  // Xóa tin nhắn sau 15s
  } else {
    // AFK is OFF => chuyển về ON và bắt đầu theo dõi tag
    afkStatus = true;
    const sentMessage = await message.channel.send('>>> AFK ON');
    setTimeout(() => sentMessage.delete(), 15000);  // Xóa tin nhắn sau 15s
  }
}

// Xử lý tin nhắn có người tag bạn khi AFK
export async function handleMessage(message) {
  if (afkStatus && message.mentions.has(message.client.user)) {
    // Lưu tin nhắn có người tag bạn
    const msgData = {
      user: message.author.username,
      timestamp: new Date().toLocaleString(),  // Thời gian tag
      guildName: message.guild ? message.guild.name : null, // Kiểm tra nếu guild tồn tại
      channelName: message.channel ? message.channel.name : null, // Kiểm tra nếu channel tồn tại
      link: message.url                        // Link tin nhắn
    };

    afkMessages.push(msgData);
    writeFileSync('./afkMessages.json', JSON.stringify(afkMessages)); // Cập nhật lại file

    // Kiểm tra xem có thể thả cảm xúc không
    try {
      await message.react('❤️');
    } catch (error) {
      console.log('Không thể thả cảm xúc ❤️ vào tin nhắn:', error);
    }
  }
}
