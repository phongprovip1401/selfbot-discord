export const name = 'uptime';
export const permission = 'everyone';

export async function execute(message, args, client) {
  const totalSeconds = Math.floor(process.uptime());
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  return `⏱ Bot đã hoạt động trong: ${uptime}`;
}
