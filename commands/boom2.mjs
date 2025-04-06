import { readFileSync } from 'fs';

export const name = 'boom2';
export const permission = 'everyone';

let isBombing = false;

export async function execute(message, args) {
  if (isBombing) {
    isBombing = false;
    return 'Đã dừng boom';
  }

  if (!args.length) {
    return 'Sử dụng: ;boom2 <id/tag người dùng>';
  }

  try {
    let userId;
    const input = args[0];

    if (input.startsWith('<@') && input.endsWith('>')) {
      userId = input.replace(/[<@!>]/g, '');
    } else {
      userId = input;
    }

    const user = await message.client.users.fetch(userId);
    if (!user) {
      return 'Không tìm thấy người dùng';
    }

    const insults = readFileSync('chui.txt', 'utf-8').split('\n').filter(line => line.trim());
    
    const textChannels = Array.from(message.guild.channels.cache.filter(
      channel => 
        channel.type === 'GUILD_TEXT' &&
        channel.permissionsFor(message.client.user).has('SEND_MESSAGES')
    ).values());

    if (textChannels.length === 0) {
      return 'Không tìm thấy kênh nào có thể gửi tin nhắn';
    }

    isBombing = true;
    for (const insult of insults) {
      if (!isBombing) break;
      if (insult.trim()) {
        const randomChannel = textChannels[Math.floor(Math.random() * textChannels.length)];
        await randomChannel.send(`${insult} <@${user.id}>`);
      }
    }
    isBombing = false;

  } catch (error) {
    console.error('Lỗi khi boom:', error);
    isBombing = false;
    return 'Có lỗi xảy ra khi boom';
  }
} 