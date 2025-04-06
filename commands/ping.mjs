export const name = 'ping';
export const permission = 'everyone';

export async function execute(message, args, client) {
  const sent = await message.channel.send('Pinging...');
  const ping = sent.createdTimestamp - message.createdTimestamp;
  await sent.delete();

  return `Pong! 🏓 ${ping}ms`;
}
