// Biến toàn cục để lưu trữ interval
let autoChatInterval = null;

export const name = 'autochat';
export const permission = 'everyone';

export async function execute(message, args) {
    // Nếu đang có interval chạy, dừng nó lại
    if (autoChatInterval) {
        clearInterval(autoChatInterval);
        autoChatInterval = null;
        const reply = await message.channel.send('✅ Đã dừng autochat');
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
        return;
    }

    // Kiểm tra đủ tham số
    if (args.length < 3) {
        const reply = await message.channel.send('❌ Thiếu tham số! Cú pháp: ;autochat <seconds> <số lần> <text>');
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
        return;
    }

    const seconds = parseInt(args[0]);
    const times = parseInt(args[1]);
    const text = args.slice(2).join(' ');

    // Kiểm tra tham số hợp lệ
    if (isNaN(seconds) || seconds <= 0 || isNaN(times) || times <= 0) {
        const reply = await message.channel.send('❌ Thời gian và số lần phải là số dương!');
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
        return;
    }

    let count = 0;
    const reply = await message.channel.send(`✅ Đã bật autochat: ${text}\nMỗi ${seconds} giây, còn ${times} lần`);
    setTimeout(() => {
        message.delete().catch(() => {});
        reply.delete().catch(() => {});
    }, 5000);

    // Bắt đầu interval
    autoChatInterval = setInterval(async () => {
        count++;
        await message.channel.send(text);
        
        if (count >= times) {
            clearInterval(autoChatInterval);
            autoChatInterval = null;
        }
    }, seconds * 1000);
} 