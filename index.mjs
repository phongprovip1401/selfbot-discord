import { Client } from 'discord.js-selfbot-v13';
import dotenv from 'dotenv';
import { handleCommands } from './handlers/commandHandler.mjs';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');

dotenv.config();

const client = new Client();
import { handleMessage } from './commands/afk.mjs';
client.on('messageCreate', handleMessage);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function loadConfig() {
    console.log('Chọn một tùy chọn để khởi động bot:');
    console.log('1. Load từ file .env');
    console.log('2. Nhập token rồi lưu vào file .json');
    console.log('3. Load từ file .json');

    const choice = await askQuestion('Nhập lựa chọn của bạn (1, 2, hoặc 3): ');

    let token;

    switch (choice.trim()) {
        case '1':
            dotenv.config();
            console.log('Đã load từ file .env');
            token = process.env.TOKEN;
            break;
        case '2':
            token = await askQuestion('Nhập token: ');
            const config = { token };
            fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
            console.log('Đã lưu thông tin vào file config.json');
            break;
        case '3':
            if (fs.existsSync('config.json')) {
                const configData = fs.readFileSync('config.json');
                const config = JSON.parse(configData);
                console.log('Đã load từ file config.json');
                token = config.token;
            } else {
                console.log('File config.json không tồn tại. Vui lòng chọn tùy chọn khác.');
                rl.close();
                return null;
            }
            break;
        default:
            console.log('Lựa chọn không hợp lệ. Vui lòng thử lại.');
            rl.close();
            return null;
    }

    rl.close();
    return { token };
}

async function startBot() {
    const config = await loadConfig();
    if (!config) return;

    const { token } = config;
    console.log('Đang khởi động bot với token:', token);

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

    client.login(token);

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
}

startBot();
