import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function handleCommands(client) {
  client.commands = new Map();

  const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.mjs'));

  for (const file of commandFiles) {
    const command = await import(`../commands/${file}`);
    if (command.name && typeof command.execute === 'function') {
      client.commands.set(command.name, command);
      console.log(`Đã tải lệnh: ${command.name}`);
    }
  }
}
