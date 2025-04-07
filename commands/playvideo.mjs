import { joinVoiceChannel, VoiceConnectionStatus, entersState, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { createReadStream } from 'fs';
import { spawn } from 'child_process';
import * as playdl from 'play-dl';
import path from 'path';
import fs from 'fs/promises';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

export const name = 'playvideo';
export const permission = 'everyone';

let currentConnection = null;
let currentStream = null;
let currentVideoDispatcher = null;
let currentAudioDispatcher = null;

// Thư mục để lưu cache video
const CACHE_DIR = './temp_videos';

// Đảm bảo thư mục cache tồn tại
async function ensureCacheDir() {
    try {
        if (!existsSync(CACHE_DIR)) {
            await fs.mkdir(CACHE_DIR, { recursive: true });
        }
    } catch (error) {
        console.error('Không thể tạo thư mục cache:', error);
    }
}

async function isYoutubeUrl(url) {
    // Kiểm tra URL có phải là YouTube không
    return url.includes('youtube.com') || url.includes('youtu.be');
}

async function getYoutubeVideo(url, messageChannel) {
    try {
        console.log('Đang lấy thông tin video YouTube với thư viện play-dl...');
        
        // Kiểm tra và xác minh URL của YouTube
        if (!playdl.yt_validate(url)) {
            throw new Error('URL YouTube không hợp lệ');
        }
        
        // Lấy thông tin video
        const videoInfo = await playdl.video_info(url);
        if (!videoInfo) {
            throw new Error('Không thể lấy thông tin video');
        }
        
        const videoTitle = videoInfo.video_details.title;
        const videoId = videoInfo.video_details.id;
        
        console.log('Đã lấy được thông tin video:', videoTitle);
        
        // Đường dẫn cho video đã tải
        await ensureCacheDir();
        const videoPath = path.join(CACHE_DIR, `${videoId}.mp4`);
        
        // Kiểm tra xem đã tải video này chưa
        if (existsSync(videoPath)) {
            console.log('Đã tìm thấy video trong cache, sử dụng trực tiếp.');
            return {
                title: videoTitle,
                duration: videoInfo.video_details.durationInSec,
                thumbnail: videoInfo.video_details.thumbnails[0].url,
                url: videoPath,
                local: true
            };
        }
        
        // Thông báo đang tải video
        const downloadMsg = await messageChannel.send('⏬ Đang tải video chất lượng cao về để phát... Vui lòng đợi, thời gian tùy thuộc vào độ dài video.');
        
        // Tải xuống video với yt-dlp
        try {
            // Kiểm tra xem yt-dlp có hoạt động không
            try {
                execSync('yt-dlp --version', { stdio: 'pipe' });
                console.log('yt-dlp đã được cài đặt, sử dụng để tải video');
                
                // Định dạng lệnh tải video với yt-dlp
                const command = `yt-dlp -o "${videoPath}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-playlist -q "${url}"`;
                console.log('Đang tải video với lệnh:', command);
                
                // Thực hiện lệnh tải video
                execSync(command, { stdio: 'pipe' });
                
                // Kiểm tra nếu file đã được tải thành công
                if (existsSync(videoPath)) {
                    console.log('Đã tải video thành công:', videoPath);
                    downloadMsg.delete().catch(() => {});
                    return {
                        title: videoTitle,
                        duration: videoInfo.video_details.durationInSec,
                        thumbnail: videoInfo.video_details.thumbnails[0].url,
                        url: videoPath,
                        local: true
                    };
                } else {
                    throw new Error('Đã tải video nhưng không tìm thấy file');
                }
            } catch (ytdlpError) {
                console.error('Lỗi với yt-dlp:', ytdlpError);
                downloadMsg.edit('⚠️ Không thể sử dụng yt-dlp, đang dùng video test thay thế...');
                
                // Sử dụng URL test nếu không thể sử dụng yt-dlp
                const testUrls = [
                    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
                ];
                
                // Chọn một URL video test ngẫu nhiên
                const directUrl = testUrls[Math.floor(Math.random() * testUrls.length)];
                
                console.log('Sử dụng video test để phát:', directUrl);
                setTimeout(() => downloadMsg.delete().catch(() => {}), 5000);
                
                return {
                    title: videoTitle,
                    duration: videoInfo.video_details.durationInSec,
                    thumbnail: videoInfo.video_details.thumbnails[0].url,
                    url: directUrl,
                    local: false,
                    isTest: true
                };
            }
        } catch (dlError) {
            console.error('Lỗi khi tải video:', dlError);
            downloadMsg.delete().catch(() => {});
            throw new Error('Không thể tải video YouTube. Lỗi: ' + dlError.message);
        }
    } catch (error) {
        console.error('Lỗi khi xử lý YouTube:', error);
        throw error;
    }
}

// Hàm tạo stream từ URL không phải YouTube
async function createNonYoutubeStream(url) {
    return url;
}

export async function execute(message, args) {
    // Nếu không có tham số và đang có kết nối -> stop và rời voice
    if (!args.length) {
        if (currentConnection) {
            if (currentVideoDispatcher) {
                currentVideoDispatcher.destroy();
                currentVideoDispatcher = null;
            }
            if (currentAudioDispatcher) {
                currentAudioDispatcher.destroy();
                currentAudioDispatcher = null;
            }
            if (currentStream) {
                currentStream = null;
            }
            currentConnection.disconnect();
            currentConnection = null;
            return message.channel.send('✅ Đã dừng phát video và rời voice!').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        }
        return message.channel.send('❌ Bot không ở trong kênh voice nào!').then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }

    if (args.length < 2) {
        return message.channel.send('❌ Thiếu thông tin! Cú pháp: ;playvideo <link/id channel voice> <link video/youtube>').then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }

    try {
        let channelId;
        const input = args[0];

        if (input.startsWith('https://discord.com/channels/')) {
            const parts = input.split('/');
            channelId = parts[parts.length - 1];
        } else if (input.startsWith('<#') && input.endsWith('>')) {
            channelId = input.slice(2, -1);
        } else {
            channelId = input;
        }

        const channel = message.guild.channels.cache.get(channelId);
        
        if (!channel) {
            return message.channel.send('❌ Không tìm thấy kênh voice').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        }

        if (channel.type !== 'GUILD_VOICE') {
            return message.channel.send('❌ Kênh này không phải là kênh voice').then(msg => {
                setTimeout(() => msg.delete().catch(() => {}), 5000);
            });
        }

        // Nếu đang có kết nối, dừng và rời voice trước
        if (currentConnection) {
            if (currentVideoDispatcher) {
                currentVideoDispatcher.destroy();
                currentVideoDispatcher = null;
            }
            if (currentAudioDispatcher) {
                currentAudioDispatcher.destroy();
                currentAudioDispatcher = null;
            }
            if (currentStream) {
                currentStream = null;
            }
            currentConnection.disconnect();
            currentConnection = null;
        }

        const loadingMsg = await message.channel.send('⏳ Đang kết nối và chuẩn bị video, vui lòng đợi...');
        
        let videoUrl = args[1];
        let videoInfo = null;
        let isLocalFile = false;
        
        try {
            // Nếu là URL YouTube, xử lý đặc biệt - tải về trước
            if (await isYoutubeUrl(videoUrl)) {
                loadingMsg.edit('🔄 Đang xử lý video YouTube, vui lòng đợi...');
                
                try {
                    // Tải video về local
                    const ytInfo = await getYoutubeVideo(videoUrl, message.channel);
                    videoInfo = ytInfo;
                    videoUrl = ytInfo.url; // Cập nhật URL thành đường dẫn local
                    isLocalFile = ytInfo.local;
                    
                    // Hiển thị thông tin video
                    loadingMsg.edit(`✅ Đã tải video: **${ytInfo.title}** (${Math.floor(ytInfo.duration/60)}:${String(ytInfo.duration%60).padStart(2, '0')})`);
                } catch (ytError) {
                    loadingMsg.delete().catch(() => {});
                    return message.channel.send('❌ Lỗi xử lý video YouTube: ' + ytError.message).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 10000);
                    });
                }
            } else {
                // URL thông thường, không phải YouTube
                videoInfo = { url: videoUrl, title: "Video" };
            }
            
            // Kết nối voice và chuẩn bị stream
            loadingMsg.edit('🔄 Đang kết nối đến voice channel...');
            
            // Kết nối voice theo cách của discord.js-selfbot-v13
            currentConnection = await message.client.voice.joinChannel(channel, {
                selfMute: false,
                selfDeaf: false,
                selfVideo: false,
                videoCodec: 'H264',
            });
            
            // Tạo stream connection
            currentStream = await currentConnection.createStreamConnection();
            
            // Chuẩn bị stream options
            const videoOptions = {
                fps: 60, // Tăng lên 60fps cho video mượt hơn
                bitrate: 8000, // Tăng bitrate lên 8000 cho chất lượng cao hơn
                options: {
                    startTime: 0,
                    endTime: 0,
                    volume: 100,
                    passes: 3, // Tăng passes lên 3 để ổn định hơn
                    fec: true,
                    prebuffer: 8192, // Tăng prebuffer
                    highWaterMark: 1024 * 1024 // Tăng highWaterMark lên 1MB
                }
            };
            
            const audioOptions = {
                volume: 100,
                bitrate: 384, // Tăng bitrate âm thanh lên 384
                passes: 3,
                fec: true,
                highWaterMark: 1024 * 1024
            };
            
            loadingMsg.edit('🔄 Đang bắt đầu phát video...');
            
            try {
                // Phát video bằng URL trực tiếp hoặc file đã tải
                currentVideoDispatcher = currentStream.playVideo(videoUrl, videoOptions);
                currentAudioDispatcher = currentStream.playAudio(videoUrl, audioOptions);
                
                // Theo dõi trạng thái phát
                let videoStarted = false;
                let audioStarted = false;
                
                // Thêm các event handlers cho video
                currentVideoDispatcher.on('start', () => {
                    console.log('Video bắt đầu phát!');
                    videoStarted = true;
                    if (isLocalFile && videoInfo?.title) {
                        loadingMsg.edit(`✅ Video đang phát chất lượng cao! **${videoInfo.title}**`);
                    } else if (videoInfo?.isTest) {
                        loadingMsg.edit(`✅ Đang phát video test thay cho YouTube video: **${videoInfo.title}**`);
                        message.channel.send('ℹ️ Lưu ý: Bot đang phát video test vì không thể phát trực tiếp nội dung YouTube. Để phát video YouTube, bạn cần cài đặt yt-dlp trên máy.').then(msg => {
                            setTimeout(() => msg.delete().catch(() => {}), 15000);
                        });
                    } else {
                        loadingMsg.edit('✅ Video đang phát!');
                    }
                });
                
                currentVideoDispatcher.on('finish', () => {
                    console.log('Video kết thúc');
                    message.channel.send('✅ Video đã phát xong!').then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 5000);
                    });
                });
                
                currentVideoDispatcher.on('error', (error) => {
                    console.error('Lỗi video:', error);
                    message.channel.send('❌ Lỗi phát video: ' + error.message).then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 5000);
                    });
                });
                
                currentAudioDispatcher.on('start', () => {
                    console.log('Audio bắt đầu phát!');
                    audioStarted = true;
                });
                
                currentAudioDispatcher.on('finish', () => {
                    console.log('Audio kết thúc');
                    // Tự động rời voice khi audio kết thúc
                    if (currentConnection) {
                        setTimeout(() => {
                            if (currentConnection) {
                                currentConnection.disconnect();
                                currentConnection = null;
                                currentVideoDispatcher = null;
                                currentAudioDispatcher = null;
                                currentStream = null;
                            }
                        }, 1000);
                    }
                });
                
                currentAudioDispatcher.on('error', (error) => {
                    console.error('Lỗi audio:', error);
                });
                
                // Kiểm tra việc phát video
                let checkCount = 0;
                const maxChecks = 6; // Kiểm tra tối đa 6 lần (30 giây)
                
                const checkInterval = setInterval(() => {
                    checkCount++;
                    
                    // Kiểm tra xem video có đang phát không
                    if (currentVideoDispatcher && !currentVideoDispatcher.destroyed && videoStarted && audioStarted) {
                        message.channel.send('🎬 Video đang phát, hãy vào voice channel để xem!').then(msg => {
                            setTimeout(() => msg.delete().catch(() => {}), 10000);
                        });
                        clearInterval(checkInterval);
                    } else if (checkCount >= maxChecks) {
                        message.channel.send('⚠️ Đã cố gắng phát video nhưng không thành công. Có thể Discord không hỗ trợ phát video này.').then(msg => {
                            setTimeout(() => msg.delete().catch(() => {}), 10000);
                        });
                        clearInterval(checkInterval);
                    } else if (!videoStarted || !audioStarted) {
                        console.log(`Kiểm tra lần ${checkCount}: Video started: ${videoStarted}, Audio started: ${audioStarted}`);
                    }
                }, 5000); // Kiểm tra mỗi 5 giây
                
            } catch (playError) {
                console.error('Lỗi khi phát video:', playError);
                loadingMsg.edit('❌ Lỗi khi phát video: ' + playError.message);
                
                // Thử phát video test nếu không phát được
                try {
                    const testUrl = 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
                    message.channel.send('⚠️ Không thể phát video yêu cầu, đang thử phát video test...').then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 5000);
                    });
                    
                    currentVideoDispatcher = currentStream.playVideo(testUrl, videoOptions);
                    currentAudioDispatcher = currentStream.playAudio(testUrl, audioOptions);
                    
                    message.channel.send('🎬 Đang phát video test. Nếu bạn cần phát video YouTube, hãy cài đặt yt-dlp trên máy của bạn.').then(msg => {
                        setTimeout(() => msg.delete().catch(() => {}), 10000);
                    });
                    
                    // Thêm các event handlers cho video test
                    currentVideoDispatcher.on('start', () => {
                        console.log('Video test bắt đầu phát!');
                        loadingMsg.edit('✅ Video test đang phát!');
                    });
                    
                    currentVideoDispatcher.on('finish', () => {
                        console.log('Video test kết thúc');
                    });
                    
                    currentAudioDispatcher.on('finish', () => {
                        if (currentConnection) {
                            setTimeout(() => {
                                if (currentConnection) {
                                    currentConnection.disconnect();
                                    currentConnection = null;
                                    currentVideoDispatcher = null;
                                    currentAudioDispatcher = null;
                                    currentStream = null;
                                }
                            }, 1000);
                        }
                    });
                } catch (testError) {
                    console.error('Lỗi ngay cả khi phát video test:', testError);
                    if (currentConnection) {
                        currentConnection.disconnect();
                        currentConnection = null;
                        currentVideoDispatcher = null;
                        currentAudioDispatcher = null;
                        currentStream = null;
                    }
                }
            }
        } catch (error) {
            console.error('Lỗi khi chuẩn bị video:', error);
            loadingMsg.edit('❌ Lỗi khi chuẩn bị video: ' + error.message);
            
            if (currentConnection) {
                currentConnection.disconnect();
                currentConnection = null;
            }
        }
    } catch (error) {
        console.error('Lỗi chung:', error);
        return message.channel.send('❌ Có lỗi xảy ra: ' + error.message).then(msg => {
            setTimeout(() => msg.delete().catch(() => {}), 5000);
        });
    }
} 