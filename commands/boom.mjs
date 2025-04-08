import { readFileSync } from 'fs';
 
 export const name = 'boom';
 export const permission = 'everyone';
 
 let isBombing = false;
 
 export async function execute(message, args) {
   if (isBombing) {
     isBombing = false;
     return 'Đã dừng boom';
   }
 
   if (!args.length) {
     return 'Sử dụng: ;boom <id/tag người dùng>';
   }
 
   try {
     let userId;
     const input = args[0];
 
     if (input.startsWith('<@') && input.endsWith('>')) {
       userId = input.replace(/[<@!>]/g, '');
     } else {
       userId = input;
     }
 
     const user = await message.client.users.fetch(userId);
     if (!user) {
       return 'Không tìm thấy người dùng';
     }
 
     const insults = readFileSync('chui.txt', 'utf-8').split('\n').filter(line => line.trim());
     
     isBombing = true;
     for (const insult of insults) {
       if (!isBombing) break;
       if (insult.trim()) {
         await message.channel.send(`${insult} <@${user.id}>`);
       }
     }
     isBombing = false;
 
   } catch (error) {
     console.error('Lỗi khi boom:', error);
     isBombing = false;
     return 'Có lỗi xảy ra khi boom';
   }
 } 