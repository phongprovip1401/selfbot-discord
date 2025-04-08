import { Client } from 'discord.js-selfbot-v13';
import dotenv from 'dotenv';
import { handleCommands } from './handlers/commandHandler.mjs';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';
import { handleMessage as handleAFKMessage } from './commands/afk.mjs';
import handleMessage from './handlers/messageHandler.mjs';
import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import handleMessageDelete from './handlers/messageDelete.mjs';
import handleMessageUpdate from './handlers/messageUpdate.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.json');
const commandsPath = path.join(__dirname, 'commands');

dotenv.config();

const gradientText = gradient('cyan', 'pink');

const boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan',
    backgroundColor: '#000000',
    title: 'MILKITA - SELFBOT DISCORD',
    titleAlignment: 'center'
};

const welcomeMessage = boxen(
    gradientText(`
    ███╗   ███╗██╗██╗     ██╗██╗  ██╗██╗████████╗ █████╗ 
    ████╗ ████║██║██║     ██║██║ ██╔╝██║╚══██╔══╝██╔══██╗
    ██╔████╔██║██║██║     ██║█████╔╝ ██║   ██║   ███████║
    ██║╚██╔╝██║██║██║     ██║██╔═██╗ ██║   ██║   ██╔══██║
    ██║ ╚═╝ ██║██║███████╗██║██║  ██╗██║   ██║   ██║  ██║
    ╚═╝     ╚═╝╚═╝╚══════╝╚═╝╚═╝  ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝
    `) + 
    chalk.cyan(`
    Version: 1.0.0
    Author: Nguyễn Thiên Phong (@phong2079)
    Discord: phong2079.
    Description: Một selfbot tùy chỉnh cho Discord, 
    được phát triển bởi phong2079 gồm nhiều tính năng 
    hiện đại và tiện lợi, sử dụng thư viện discord.js-selfbot-v13
    
    `) +
    chalk.yellow(`Features:
    • Nhẹ, nhanh và ổn định
    • Hệ thống lệnh đơn giản, dễ sử dụng
    • Hỗ trợ định dạng tin nhắn kiểu rõ ràng, đẹp mắt
    • Nhiều tiện ích hỗ trợ cá nhân
    • Luôn cập nhật tính năng mới...
    `),
    boxenOptions
);

const client = new Client();
client.commands = new Map();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

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

async function loadConfig() {
    console.log(chalk.yellow('\nChọn một tùy chọn để khởi động bot:'));
    console.log(chalk.cyan('1. Load từ file .env'));
    console.log(chalk.cyan('2. Nhập token rồi lưu vào file config.json'));
    console.log(chalk.cyan('3. Load từ file config.json'));

    const choice = await askQuestion(chalk.yellow('Nhập lựa chọn của bạn (1, 2, hoặc 3): '));

    let token;

    switch (choice.trim()) {
        case '1':
            dotenv.config();
            console.log(chalk.green('✅ Đã load từ file .env'));
            token = process.env.DISCORD_TOKEN;
            break;
        case '2':
            token = await askQuestion(chalk.cyan('🔑 Nhập token: '));
            const config = { token, prefix: ';' };
            fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
            console.log(chalk.green('✅ Đã lưu thông tin vào file config.json'));
            break;
        case '3':
            if (fs.existsSync(CONFIG_PATH)) {
                const configData = fs.readFileSync(CONFIG_PATH);
                const config = JSON.parse(configData);
                console.log(chalk.green('✅ Đã load từ file config.json'));
                token = config.token;
            } else {
                console.log(chalk.red('❌ File config.json không tồn tại. Vui lòng chọn tùy chọn khác.'));
                rl.close();
                return null;
            }
            break;
        default:
            console.log(chalk.red('❌ Lựa chọn không hợp lệ. Vui lòng thử lại.'));
            rl.close();
            return null;
    }

    return { token };
}

async function startBot() {
    try {
        console.clear();
        console.log(welcomeMessage);

        const config = await loadConfig();
        if (!config) return;

        const { token } = config;
        if (!token) {
            console.log(chalk.red('❌ Token không hợp lệ, vui lòng kiểm tra lại!'));
            process.exit(1);
        }

        console.log(chalk.cyan('\n🔐 Đang đăng nhập...'));
        await client.login(token);
        console.log(chalk.green('✅ Đăng nhập thành công!'));
        
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.mjs'));
        let loadedCommands = 0;
        let failedCommands = 0;

        for (const file of commandFiles) {
            try {
                const filePath = path.join(commandsPath, file);
                const fileUrl = new URL(`file://${filePath.replace(/\\/g, '/')}`).href;
                const command = await import(fileUrl);
                client.commands.set(command.name, command);
                loadedCommands++;
            } catch (error) {
                console.error(`Lỗi khi tải lệnh ${file}:`, error);
                failedCommands++;
            }
        }

        if (failedCommands === 0) {
            console.log(`✅ Đã tải thành công ${loadedCommands} lệnh!`);
        } else {
            console.log(`⚠️ Đã tải ${loadedCommands} lệnh, ${failedCommands} lệnh thất bại!`);
        }
        
        console.log(chalk.cyan('\n🤖 Thông tin selfbot:'));
        console.log(chalk.cyan(`• Username: ${client.user.username}`));
        console.log(chalk.cyan(`• ID: ${client.user.id}`));
        console.log(chalk.cyan(`• Prefix hiện tại: ${getPrefix()}`));
        console.log(chalk.cyan(`• Số server đang ở: ${client.guilds.cache.size}`));

        const showLogs = await askQuestion(chalk.yellow('\nBạn có muốn hiển thị tất cả tin nhắn trong console và lưu vào log không? (y/n): '));
        if (showLogs.toLowerCase() === 'y') {
            console.log(chalk.green('✅ Đã bật hiển thị tin nhắn'));
            process.env.SHOW_MESSAGE_HANDLER = 'true';
        } else {
            console.log(chalk.yellow('⚠️ Đã tắt hiển thị tin nhắn'));
            process.env.SHOW_MESSAGE_HANDLER = 'false';
        }
        
        console.log(chalk.green('\n✨ Bot đã sẵn sàng!'));

        client.on('messageCreate', handleMessage);
        client.on('messageDelete', handleMessageDelete);
        client.on('messageUpdate', handleMessageUpdate);

        client.on('messageCreate', async (message) => {
            const prefix = getPrefix();
            if (!message.content.startsWith(prefix)) return;
            if (message.author.id !== client.user.id) return;

            const args = message.content.slice(prefix.length).trim().split(/ +/);
            const cmd = args.shift().toLowerCase();

            message.delete().catch(() => {});

            if (client.commands.has(cmd)) {
                const command = client.commands.get(cmd);

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

        client.on('messageCreate', handleAFKMessage);

    } catch (error) {
        console.log(chalk.red(`\n❌ Lỗi khi đăng nhập: ${error.message}`));
        process.exit(1);
    }
}

startBot();
