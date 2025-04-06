export const name = 'spam';
export const permission = 'everyone';

export async function execute(message, args) {
  if (args.length < 3) {
    return 'Sử dụng: ;spam <số lượng> <time delay> <nội dung>';
  }

  const count = parseInt(args[0]);
  if (isNaN(count) || count <= 0) {
    return 'Số lượng tin nhắn phải là số dương';
  }

  const maxCount = 50;
  if (count > maxCount) {
    return `Số lượng tin nhắn tối đa là ${maxCount}`;
  }

  const delay = parseFloat(args[1]);
  if (isNaN(delay) || delay < 0) {
    return 'Thời gian delay phải là số không âm';
  }

  const text = args.slice(2).join(' ');
  if (!text) {
    return 'Vui lòng nhập nội dung cần spam';
  }

  try {
    for (let i = 0; i < count; i++) {
      await message.channel.send(text);
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }
  } catch (error) {
    console.error('Lỗi khi spam tin nhắn:', error);
    return 'Có lỗi xảy ra khi spam tin nhắn';
  }
} 