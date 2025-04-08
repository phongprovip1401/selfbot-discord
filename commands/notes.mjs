import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import moment from 'moment';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NOTES_FILE = path.join(__dirname, '../notes.json');

function getNotes() {
    try {
        const data = fs.readFileSync(NOTES_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc notes:', error);
        return [];
    }
}

export const name = 'notes';
export const description = 'Xem danh sách ghi chú';
export const execute = async (message, args) => {
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
    }, 30000);
}; 