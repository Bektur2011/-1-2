const TelegramBot = require('node-telegram-bot-api');
const { addHomework, getAllHomework } = require('./supabase');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const adminIds = process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim()));

if (!token) throw new Error('BOT_TOKEN должен быть указан в .env файле');

const bot = new TelegramBot(token, { polling: true });

function isAdmin(userId) {
  return adminIds.includes(userId);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
    return;
  }

  bot.sendMessage(chatId, 
    '👋 Добро пожаловать в StudyCore Bot!\n\n' +
    'Доступные команды:\n' +
    '/add заголовок | описание - добавить задание\n' +
    '/list - показать все задания'
  );
});

bot.onText(/\/add (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
    return;
  }

  const input = match[1];
  const parts = input.split('|').map(s => s.trim());

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    bot.sendMessage(chatId, 
      '❌ Неверный формат.\n\n' +
      'Используйте: /add заголовок | описание\n' +
      'Пример: /add Математика | Решить задачи 1-10'
    );
    return;
  }

  const [title, description] = parts;

  try {
    const homework = await addHomework(title, description);
    bot.sendMessage(chatId,
      '✅ Задание добавлено!\n\n' +
      `📝 ID: ${homework.id}\n` +
      `📌 ${homework.title}\n` +
      `📄 ${homework.description}\n` +
      `📅 ${formatDate(homework.created_at)}`
    );
  } catch (error) {
    console.error('Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при добавлении задания.');
  }
});

bot.onText(/\/list/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
    return;
  }

  try {
    const homeworks = await getAllHomework();

    if (homeworks.length === 0) {
      bot.sendMessage(chatId, '📭 Пока нет заданий.');
      return;
    }

    let message = `📚 Всего заданий: ${homeworks.length}\n\n`;

    homeworks.forEach((hw, index) => {
      message += `${index + 1}. ID: ${hw.id}\n`;
      message += `📌 ${hw.title}\n`;
      message += `📄 ${hw.description}\n`;
      message += `📅 ${formatDate(hw.created_at)}\n\n`;
    });

    const maxLength = 4000;
    if (message.length > maxLength) {
      for (let i = 0; i < message.length; i += maxLength) {
        bot.sendMessage(chatId, message.substring(i, i + maxLength));
      }
    } else {
      bot.sendMessage(chatId, message);
    }
  } catch (error) {
    console.error('Ошибка:', error);
    bot.sendMessage(chatId, '❌ Ошибка при получении заданий.');
  }
});

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return;

  if (!isAdmin(userId)) {
    bot.sendMessage(chatId, '❌ У вас нет доступа к этому боту.');
    return;
  }

  bot.sendMessage(chatId, '❓ Неизвестная команда. Используйте /start');
});

console.log('🤖 Бот запущен и готов к работе!');
console.log(`👥 Администраторы: ${adminIds.join(', ')}`);
