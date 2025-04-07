import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATUS_CONFIG_PATH = path.join(__dirname, '../status_config.json');

const VALID_OPTIONS = ['app_name', 'type', 'large_image', 'small_image', 'details', 'timestamp'];
const VALID_TYPES = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];

export const name = 'status';
export const permission = 'everyone';

export async function execute(message, args) {
    if (!args.length) {
        return `❌ Cú pháp: 
• ;status on - Bật trạng thái
• ;status off - Tắt trạng thái
• ;status edit <lựa chọn> <giá trị>

Các lựa chọn:
• app_name: Tên ứng dụng hiển thị
• type: Loại hoạt động (${VALID_TYPES.join(', ')})
• large_image: Đính kèm ảnh lớn hoặc URL
• small_image: Đính kèm ảnh nhỏ hoặc URL
• details: Chi tiết hoạt động
• timestamp: true/false/số giây (ví dụ: true, false, 3600 cho 1 giờ)

Ví dụ:
;status edit app_name My Game
;status edit type PLAYING
;status edit large_image (kèm ảnh)
;status edit details "Đang chơi game"
;status edit timestamp true
;status edit timestamp 3600`;
    }

    // Xử lý on/off
    if (args[0].toLowerCase() === 'on' || args[0].toLowerCase() === 'off') {
        const isOn = args[0].toLowerCase() === 'on';
        try {
            if (isOn) {
                // Đọc config và bật lại presence
                const config = JSON.parse(readFileSync(STATUS_CONFIG_PATH, 'utf8'));
                
                // Tạo activity object
                const activity = {
                    name: config.app_name,
                    type: config.type,
                    url: null // Cần thiết cho Discord
                };

                // Thêm details nếu có
                if (config.details) {
                    activity.details = config.details;
                }

                // Thêm timestamps nếu có
                if (config.timestamp) {
                    activity.timestamps = {
                        start: typeof config.timestamp === 'number' 
                            ? Date.now() - (config.timestamp * 1000)
                            : Date.now()
                    };
                }

                // Thêm assets nếu có
                if (config.large_image || config.small_image) {
                    activity.assets = {};
                    if (config.large_image) activity.assets.large_image = config.large_image;
                    if (config.small_image) activity.assets.small_image = config.small_image;
                }

                // Cập nhật presence
                await message.client.user.setActivity(activity);
            } else {
                // Tắt presence
                await message.client.user.setActivity(null);
            }
            return `✅ Đã ${isOn ? 'bật' : 'tắt'} trạng thái!`;
        } catch (err) {
            console.error('Lỗi khi thay đổi trạng thái:', err);
            return '❌ Có lỗi xảy ra khi thay đổi trạng thái!';
        }
    }

    if (args[0].toLowerCase() !== 'edit') {
        return '❌ Lệnh không hợp lệ! Sử dụng ;status để xem hướng dẫn.';
    }

    if (args.length < 2) {
        return '❌ Thiếu thông tin! Cú pháp: ;status edit <lựa chọn> <giá trị>';
    }

    const option = args[1].toLowerCase();

    if (!VALID_OPTIONS.includes(option)) {
        return `❌ Lựa chọn không hợp lệ! Các lựa chọn có sẵn: ${VALID_OPTIONS.join(', ')}`;
    }

    try {
        // Đọc config hiện tại
        let config = {};
        try {
            config = JSON.parse(readFileSync(STATUS_CONFIG_PATH, 'utf8'));
        } catch (err) {
            config = {
                app_name: "Discord Selfbot",
                type: "PLAYING",
                large_image: "",
                small_image: "",
                details: "",
                timestamp: false
            };
        }

        // Xử lý các trường hợp đặc biệt
        if (option === 'large_image' || option === 'small_image') {
            // Kiểm tra xem có file đính kèm không
            const attachment = message.attachments.first();
            if (attachment) {
                config[option] = attachment.url;
            } else if (args.length >= 3) {
                // Nếu không có file, thử xử lý như URL
                const value = args.slice(2).join(' ');
                try {
                    new URL(value);
                    config[option] = value;
                } catch (err) {
                    return '❌ URL ảnh không hợp lệ!';
                }
            } else {
                return '❌ Vui lòng đính kèm ảnh hoặc cung cấp URL!';
            }
        } else {
            // Xử lý các option khác
            if (args.length < 3) {
                return '❌ Thiếu giá trị! Cú pháp: ;status edit <lựa chọn> <giá trị>';
            }
            const value = args.slice(2).join(' ');

            if (option === 'type') {
                if (!VALID_TYPES.includes(value.toUpperCase())) {
                    return `❌ Loại hoạt động không hợp lệ! Các loại có sẵn: ${VALID_TYPES.join(', ')}`;
                }
                config[option] = value.toUpperCase();
            } else if (option === 'timestamp') {
                if (value.toLowerCase() === 'true') {
                    config[option] = true;
                } else if (value.toLowerCase() === 'false') {
                    config[option] = false;
                } else {
                    // Thử chuyển đổi thành số giây
                    const seconds = parseInt(value);
                    if (isNaN(seconds) || seconds <= 0) {
                        return '❌ Giá trị timestamp phải là true, false hoặc số giây lớn hơn 0!';
                    }
                    config[option] = seconds;
                }
            } else {
                config[option] = value;
            }
        }

        // Lưu config
        writeFileSync(STATUS_CONFIG_PATH, JSON.stringify(config, null, 2));

        // Cập nhật rich presence
        try {
            // Tạo activity object
            const activity = {
                name: config.app_name,
                type: config.type,
                url: null // Cần thiết cho Discord
            };

            // Thêm details nếu có
            if (config.details) {
                activity.details = config.details;
            }

            // Thêm timestamps nếu có
            if (config.timestamp) {
                activity.timestamps = {
                    start: typeof config.timestamp === 'number' 
                        ? Date.now() - (config.timestamp * 1000)
                        : Date.now()
                };
            }

            // Thêm assets nếu có
            if (config.large_image || config.small_image) {
                activity.assets = {};
                if (config.large_image) activity.assets.large_image = config.large_image;
                if (config.small_image) activity.assets.small_image = config.small_image;
            }

            // Cập nhật presence
            await message.client.user.setActivity(activity);
            return `✅ Đã cập nhật ${option}${option.includes('image') ? ' (đã thêm ảnh)' : `: ${args.slice(2).join(' ')}`}`;
        } catch (err) {
            console.error('Lỗi khi cập nhật presence:', err);
            return '❌ Có lỗi xảy ra khi cập nhật trạng thái!';
        }

    } catch (err) {
        console.error('Lỗi khi lưu config:', err);
        return '❌ Có lỗi xảy ra khi lưu cấu hình!';
    }
}