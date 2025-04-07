export const name = 'purge';
export const permission = 'everyone';

export async function execute(message, args) {
    // Kiểm tra có nhập số lượng không
    if (!args.length) {
        return '❌ Vui lòng nhập số lượng tin nhắn cần xóa! Ví dụ: ;purge 10';
    }

    // Kiểm tra số lượng có hợp lệ không
    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        return '❌ Số lượng tin nhắn không hợp lệ!';
    }

    try {
        // Lấy 100 tin nhắn gần nhất (giới hạn của Discord)
        const messages = await message.channel.messages.fetch({ limit: 100 });
        
        // Lọc ra tin nhắn của người dùng
        const userMessages = messages.filter(msg => msg.author.id === message.author.id);
        
        // Lấy số lượng tin nhắn cần xóa
        const messagesToDelete = userMessages.first(amount);

        if (messagesToDelete.length === 0) {
            return '❌ Không tìm thấy tin nhắn nào của bạn để xóa!';
        }

        // Xóa từng tin nhắn
        let deletedCount = 0;
        for (const msg of messagesToDelete) {
            try {
                await msg.delete();
                deletedCount++;
            } catch (err) {
                console.error(`Không thể xóa tin nhắn:`, err);
                // Tiếp tục với tin nhắn tiếp theo
            }
        }

        // Gửi thông báo kết quả
        const reply = `✅ Đã xóa ${deletedCount} tin nhắn!`;
        const sent = await message.channel.send(reply);
        setTimeout(() => sent.delete().catch(() => {}), 5000);
        return;

    } catch (err) {
        console.error('Lỗi khi xóa tin nhắn:', err);
        if (err.code === 50013) { // Missing Permissions
            return '❌ Bot không có quyền xóa tin nhắn trong kênh này!';
        }
        return '❌ Có lỗi xảy ra khi xóa tin nhắn!';
    }
} 