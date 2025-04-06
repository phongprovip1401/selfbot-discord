import { writeFileSync, readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, '../config.json');

export const name = 'prefix';
export const permission = 'admin';

export async function execute(message, args) {
    if (!args.length) {
        return '❌ Vui lòng nhập prefix mới! Ví dụ: ;prefix !'
    }

    const newPrefix = args[0];
    
    // Kiểm tra prefix hợp lệ
    if (newPrefix.length > 3) {
        return '❌ Prefix không được dài quá 3 ký tự!';
    }

    // Đọc config hiện tại
    let config = {};
    if (existsSync(CONFIG_PATH)) {
        try {
            config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
        } catch (err) {
            console.error('Lỗi khi đọc file config:', err);
        }
    }

    // Cập nhật prefix
    config.prefix = newPrefix;

    // Lưu config
    try {
        writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
        return `✅ Đã đổi prefix thành \`${newPrefix}\``;
    } catch (err) {
        console.error('Lỗi khi lưu prefix:', err);
        return '❌ Có lỗi xảy ra khi lưu prefix mới!';
    }
} 