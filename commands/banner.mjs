import { Client, Message } from 'discord.js-selfbot-v13';

export const name = 'banner';
export const permission = 'everyone';

export async function execute(message, args, client) {
    try {
        let member = message.mentions.members?.first() || message?.guild?.members.cache.get(args[0] || client.user.id);
        if (!member) {
            member = client.users.cache.get(args[0] || client.user.id);
        }

        if (!member) {
            const reply = await message.channel.send('❌ Không tìm thấy người dùng!');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 3000);
            return;
        }

        // Fetch thông tin đầy đủ của user
        const fullUser = await client.users.fetch(member.id, { force: true });
        
        let banner = fullUser.bannerURL({ dynamic: true, size: 4096 });
        
        if (!banner) {
            const reply = await message.channel.send(`❌ ${fullUser.displayName || fullUser.username} không có banner!`);
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 3000);
            return;
        }

        const reply = await message.channel.send(`**${fullUser.displayName || fullUser.username}** Banner: ${banner}`);
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 60000);
    } catch (error) {
        console.error('Lỗi khi thực thi lệnh banner:', error);
        const reply = await message.channel.send('❌ Có lỗi xảy ra khi thực thi lệnh!');
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 3000);
    }
} 