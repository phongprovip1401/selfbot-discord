import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BANKS_PATH = path.join(__dirname, '../banks.json');
const USER_BANKS_PATH = path.join(__dirname, '../userbanks.json');
const BANKS_PER_PAGE = 15;

export const name = 'qr';
export const permission = 'everyone';

export async function execute(message, args) {
    if (!args.length) {
        return '❌ Vui lòng nhập option! Ví dụ:\n;qr id <từ khóa>\n;qr edit <id bank> <số tài khoản> <tên chủ tài khoản>\n;qr bank <số tiền> [nội dung]';
    }

    const option = args[0].toLowerCase();

    if (option === 'id') {
        if (!args[1]) {
            return '❌ Vui lòng nhập từ khóa! Ví dụ: ;qr id mb';
        }

        try {
            const banksData = JSON.parse(readFileSync(BANKS_PATH, 'utf8'));
            const keyword = args.slice(1).join(' ').toLowerCase();
            const filteredBanks = banksData.banks.filter(bank => 
                bank.code.toLowerCase().includes(keyword) ||
                bank.shortName.toLowerCase().includes(keyword) ||
                bank.name.toLowerCase().includes(keyword)
            );

            if (filteredBanks.length === 0) {
                return '❌ Không tìm thấy ngân hàng nào phù hợp!';
            }

            // Format kết quả tìm kiếm
            let response = '```\nKết quả tìm kiếm cho: ' + keyword + '\n';
            response += 'ID | Code | Short Name | Name\n';
            response += '-'.repeat(50) + '\n';

            filteredBanks.forEach(bank => {
                response += `${bank.id.toString().padEnd(3)} | ${bank.code.padEnd(6)} | ${bank.shortName.padEnd(12)} | ${bank.name}\n`;
            });

            response += `\nTìm thấy ${filteredBanks.length} kết quả\`\`\``;
            
            const sent = await message.channel.send(response);
            setTimeout(() => sent.delete().catch(() => {}), 30000);
            return;
        } catch (err) {
            console.error('Lỗi khi đọc file banks.json:', err);
            return '❌ Có lỗi xảy ra khi lấy danh sách ngân hàng!';
        }
    }

    if (option === 'bank') {
        if (args.length < 2) {
            return '❌ Thiếu thông tin! Cú pháp: ;qr bank <số tiền> [nội dung]';
        }

        try {
            // Đọc thông tin tài khoản của user
            const userBanksData = JSON.parse(readFileSync(USER_BANKS_PATH, 'utf8'));
            const userId = message.author.id;
            const userAccount = userBanksData.accounts[userId];

            if (!userAccount) {
                return '❌ Bạn chưa thiết lập tài khoản ngân hàng! Dùng lệnh ;qr edit để thêm tài khoản.';
            }

            // Lấy số tiền và nội dung
            const amount = parseInt(args[1].replace(/[,.]/g, '')); // Loại bỏ dấu phẩy và chấm
            if (isNaN(amount) || amount <= 0) {
                return '❌ Số tiền không hợp lệ!';
            }

            const content = args.slice(2).join(' ') || 'Chuyen tien'; // Nội dung mặc định nếu không có

            // Tạo QR cho tài khoản
            const qrUrl = `https://img.vietqr.io/image/${userAccount.bankCode}-${userAccount.accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(userAccount.accountName)}`;
            
            try {
                const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
                const qrFile = {
                    attachment: Buffer.from(response.data),
                    name: `qr_${userAccount.bankCode}_${userAccount.accountNumber}.png`
                };

                // Tạo tin nhắn với thông tin chuyển khoản
                const infoMessage = `💳 **Thông tin chuyển khoản**\n` + 
                    `**${userAccount.bankName}**\nSố TK: \`${userAccount.accountNumber}\`\nTên TK: \`${userAccount.accountName}\`` +
                    `\n\nSố tiền: \`${amount.toLocaleString('vi-VN')} VNĐ\`\nNội dung: \`${content}\``;

                // Gửi tin nhắn và hình QR
                await message.channel.send({
                    content: infoMessage,
                    files: [qrFile]
                });
                return;

            } catch (err) {
                console.error('Lỗi khi tạo QR:', err);
                return '❌ Có lỗi xảy ra khi tạo mã QR!';
            }

        } catch (err) {
            console.error('Lỗi khi đọc thông tin tài khoản:', err);
            return '❌ Có lỗi xảy ra khi lấy thông tin tài khoản!';
        }
    }

    if (option === 'edit') {
        // Kiểm tra đủ tham số
        if (args.length < 4) {
            return '❌ Thiếu thông tin! Cú pháp: ;qr edit <id bank> <số tài khoản> <tên chủ tài khoản>';
        }

        const bankId = parseInt(args[1]);
        const accountNumber = args[2];
        // Ghép các phần còn lại làm tên chủ tài khoản
        const accountName = args.slice(3).join(' ');

        try {
            // Kiểm tra id bank có tồn tại
            const banksData = JSON.parse(readFileSync(BANKS_PATH, 'utf8'));
            const bank = banksData.banks.find(b => b.id === bankId);
            
            if (!bank) {
                return '❌ ID ngân hàng không tồn tại! Dùng lệnh ;qr id để tìm ID ngân hàng.';
            }

            // Đọc dữ liệu tài khoản người dùng
            let userBanksData = {};
            try {
                userBanksData = JSON.parse(readFileSync(USER_BANKS_PATH, 'utf8'));
            } catch (err) {
                userBanksData = { accounts: {} };
            }

            // Lưu thông tin tài khoản mới
            const userId = message.author.id;
            const isUpdate = userBanksData.accounts[userId] !== undefined;

            // Cập nhật hoặc tạo mới tài khoản
            userBanksData.accounts[userId] = {
                bankId,
                bankCode: bank.code,
                bankName: bank.shortName,
                accountNumber,
                accountName
            };

            // Lưu vào file
            writeFileSync(USER_BANKS_PATH, JSON.stringify(userBanksData, null, 2));

            return `✅ Đã ${isUpdate ? 'cập nhật' : 'thêm'} tài khoản:\nNgân hàng: ${bank.shortName}\nSố TK: ${accountNumber}\nTên TK: ${accountName}`;

        } catch (err) {
            console.error('Lỗi khi lưu thông tin tài khoản:', err);
            return '❌ Có lỗi xảy ra khi lưu thông tin tài khoản!';
        }
    }

    return '❌ Option không hợp lệ! Các option có sẵn: id, edit, bank';
} 