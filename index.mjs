import { Client } from 'discord.js-selfbot-v13';
import dotenv from 'dotenv';
import { handleCommands } from './handlers/commandHandler.mjs';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');

dotenv.config();

const client = new Client();
import { handleMessage } from './commands/afk.mjs';
client.on('messageCreate', handleMessage);

// Đọc prefix từ config, mặc định là ;
function getPrefix() {
  if (existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      return config.prefix || ';';
    } catch (err) {
      console.error('Lỗi khi đọc prefix từ config:', err);
      return ';';
    }
  }
  return ';';
}

client.on('ready', async () => {
  console.log(`${client.user.username} is online!`);
  await handleCommands(client);
});

client.on('messageCreate', async (message) => {
  const prefix = getPrefix();
  if (!message.content.startsWith(prefix)) return;
  if (message.author.id !== client.user.id) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  message.delete().catch(() => {});

  if (client.commands.has(cmd)) {
    const command = client.commands.get(cmd);

    // PHÂN QUYỀN
    const perm = command.permission || 'everyone';
    const authorId = message.author.id;

    if (perm === 'owner' && authorId !== process.env.OWNER_ID) {
      return message.channel.send('`❌ Lệnh này chỉ dành cho chủ bot (selfbot).`')
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
    }

    if (perm === 'admin') {
      const isAdmin = message.member?.permissions?.has('Administrator') || false;
      if (!isAdmin) {
        return message.channel.send('`❌ Lệnh này chỉ dành cho Admin.`')
          .then(msg => setTimeout(() => msg.delete().catch(() => {}), 15000));
      }
    }

    try {
      const reply = await command.execute(message, args, client);
      if (reply && typeof reply === 'string') {
        const sent = await message.channel.send(`\`${reply}\``);
        setTimeout(() => sent.delete().catch(() => {}), 15000);
      }
    } catch (err) {
      console.error(`Lỗi khi chạy lệnh ${cmd}:`, err);
    }
  }
});

client.login(process.env.TOKEN);
