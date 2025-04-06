export const name = 'typing';
export const permission = 'everyone';

export async function execute(message, args) {
  if (args.length < 2) {
    return 'Sử dụng: ;typing <speed(ms)> <nội dung>';
  }

  const speed = parseInt(args[0]);
  if (isNaN(speed) || speed < 0) {
    return 'Tốc độ typing phải là số không âm (ms)';
  }

  const text = args.slice(1).join(' ');
  if (!text) {
    return 'Vui lòng nhập nội dung để typing';
  }

  let currentText = '';

  try {
    const typingMessage = await message.channel.send('`‎`');

    for (let i = 0; i < text.length; i++) {
      currentText += text[i];
      await typingMessage.edit(`\`${currentText}\``);
      if (speed > 0) {
        await new Promise(resolve => setTimeout(resolve, speed));
      }
    }
  } catch (error) {
    console.error('Lỗi khi typing:', error);
    return 'Có lỗi xảy ra khi typing';
  }
} 