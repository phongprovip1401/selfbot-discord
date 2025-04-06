export const name = 'say';
export const permission = 'everyone';

export async function execute(message, args) {
  if (!args.length) return 'Bạn chưa nhập gì để nói.';
  return args.join(' ');
}
