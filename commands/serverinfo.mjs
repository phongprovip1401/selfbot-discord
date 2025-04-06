export const name = 'serverinfo';
export const permission = 'everyone';

export async function execute(message) {
  const guild = message.guild;
  if (!guild) return '❌ Không thể lấy thông tin server ở đây.';

  const name = guild.name;
  const id = guild.id;
  const memberCount = guild.memberCount;
  const ownerId = guild.ownerId;
  const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;
  const boostCount = guild.premiumSubscriptionCount || 0;
  const boostTier = guild.premiumTier?.replace('TIER_', '') || 'NONE';
  const iconURL = guild.iconURL({ dynamic: true, size: 512 }) || 'https://www.example.com/default-icon.png';

  const response = `>>> **Server: ${name}**
 **Server ID:** ${id}
 **Owner:** <@${ownerId}>
 **Members:** ${memberCount}
 **Boosts:** ${boostCount}
 **Tạo lúc:** ${createdAt}`;

  const sent = await message.channel.send(response);
  setTimeout(() => sent.delete().catch(() => {}), 15000);
}
