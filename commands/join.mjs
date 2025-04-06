import { joinVoiceChannel, VoiceConnectionStatus, entersState } from '@discordjs/voice';

export const name = 'join';
export const permission = 'everyone';

let currentConnection = null;
let currentChannelId = null;
let isAutoRejoining = false;
let retryCount = 0;
const MAX_RETRIES = 10;

async function connectToChannel(channel) {
  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      if (!isAutoRejoining) return;
      
      try {
        if (retryCount >= MAX_RETRIES) {
          isAutoRejoining = false;
          currentConnection = null;
          currentChannelId = null;
          retryCount = 0;
          return;
        }

        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
        retryCount++;
      } catch (error) {
        connection.destroy();
        if (isAutoRejoining) {
          currentConnection = await connectToChannel(channel);
        }
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      if (isAutoRejoining) {
        setTimeout(async () => {
          if (isAutoRejoining) {
            currentConnection = await connectToChannel(channel);
          }
        }, 5000);
      }
    });

    return connection;
  } catch (error) {
    console.error('Lỗi khi kết nối voice:', error);
    throw error;
  }
}

export async function execute(message, args) {
  if (!args.length) {
    if (currentConnection) {
      isAutoRejoining = false;
      currentConnection.destroy();
      currentConnection = null;
      currentChannelId = null;
      retryCount = 0;
      return 'Đã ngắt kết nối khỏi kênh voice';
    }
    return 'Sử dụng: ;join <link/tag/id voice channel>';
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
      return 'Không tìm thấy kênh voice';
    }

    if (channel.type !== 'GUILD_VOICE') {
      return 'Kênh này không phải là kênh voice';
    }

    if (currentConnection && currentChannelId === channelId) {
      isAutoRejoining = false;
      currentConnection.destroy();
      currentConnection = null;
      currentChannelId = null;
      retryCount = 0;
      return 'Đã ngắt kết nối khỏi kênh voice';
    }
    
    if (currentConnection) {
      isAutoRejoining = false;
      currentConnection.destroy();
      currentConnection = null;
      currentChannelId = null;
      retryCount = 0;
    }

    isAutoRejoining = true;
    retryCount = 0;
    currentChannelId = channelId;
    currentConnection = await connectToChannel(channel);

    return `Đã vào kênh voice: ${channel.name}`;
  } catch (error) {
    console.error('Lỗi khi join voice:', error);
    return 'Có lỗi xảy ra khi tham gia kênh voice';
  }
} 