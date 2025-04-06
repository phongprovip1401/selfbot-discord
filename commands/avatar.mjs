export const name = 'avatar';
export const permission = 'everyone';

export async function execute(message, args) {
  if (!args.length) {
    return 'Sử dụng: ;avatar <id/tag người dùng>';
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

    const avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096` : user.defaultAvatarURL;
    const sent = await message.channel.send(`${user.tag}\n${avatarUrl}`);
    setTimeout(() => sent.delete().catch(() => {}), 15000);

  } catch (error) {
    console.error('Lỗi khi lấy avatar:', error);
    return 'Có lỗi xảy ra khi lấy avatar';
  }
} 