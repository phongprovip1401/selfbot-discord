import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_FILE = path.join(__dirname, '../notes.json');
const CONFIG_PATH = path.join(__dirname, '../config.json');

// Đảm bảo file notes.json tồn tại
if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

function getNotes() {
    try {
        const data = fs.readFileSync(NOTES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc notes:', error);
        return [];
    }
}

function saveNotes(notes) {
    try {
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    } catch (error) {
        console.error('Lỗi khi lưu notes:', error);
    }
}

function getPrefix() {
    try {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
        return config.prefix || ';';
    } catch (error) {
        return ';';
    }
}

export const name = 'note';
export const description = 'Quản lý ghi chú';
export const execute = async (message, args) => {
    const prefix = getPrefix();
    
    if (args.length === 0) {
        const reply = await message.channel.send(`Vui lòng sử dụng:\n${prefix}note <nội dung> - Thêm ghi chú\n${prefix}note notes - Xem tất cả ghi chú\n${prefix}note delete <id> - Xóa ghi chú`);
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 15000);
        return;
    }

    const subCommand = args[0].toLowerCase();
    
    if (subCommand === 'delete') {
        if (args.length < 2) {
            const reply = await message.channel.send('Vui lòng cung cấp ID của ghi chú cần xóa');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 5000);
            return;
        }

        const id = parseInt(args[1]);
        const notes = getNotes();
        const noteIndex = notes.findIndex(note => note.id === id);

        if (noteIndex === -1) {
            const reply = await message.channel.send('Không tìm thấy ghi chú với ID này');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 5000);
            return;
        }

        // Xóa note
        notes.splice(noteIndex, 1);

        // Đánh số lại các note còn lại
        notes.forEach((note, index) => {
            note.id = index + 1;
        });

        saveNotes(notes);
        const reply = await message.channel.send(`Đã xóa ghi chú #${id} và đánh số lại các ghi chú còn lại`);
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
        return;
    }

    if (subCommand === 'notes') {
        const notes = getNotes();
        if (notes.length === 0) {
            const reply = await message.channel.send('Chưa có ghi chú nào');
            setTimeout(() => {
                message.delete().catch(() => {});
                reply.delete().catch(() => {});
            }, 5000);
            return;
        }

        const notesList = notes.map(note => {
            const time = moment(note.timestamp).format('DD/MM/YYYY HH:mm:ss');
            return `#${note.id} - ${note.content} (${time})`;
        }).join('\n');

        const reply = await message.channel.send(`Danh sách ghi chú:\n\`\`\`\n${notesList}\n\`\`\``);
        setTimeout(() => {
            message.delete().catch(() => {});
            reply.delete().catch(() => {});
        }, 5000);
        return;
    }

    // Thêm ghi chú mới
    const content = args.join(' ');
    const notes = getNotes();
    const newId = notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1;
    const timestamp = new Date().toISOString();
    
    notes.push({
        id: newId,
        content: content,
        timestamp: timestamp
    });

    saveNotes(notes);
    const time = moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
    const reply = await message.channel.send(`Đã thêm ghi chú #${newId}: ${content} (${time})`);
    setTimeout(() => {
        message.delete().catch(() => {});
        reply.delete().catch(() => {});
    }, 5000);
}; 