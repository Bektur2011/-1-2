const TelegramBot = require('node-telegram-bot-api');
const { addHomework, getAllHomework } = require('./supabase');
require('dotenv').config();

const token = process.env.BOT_TOKEN;
const adminIds = process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim(), 10));

if (!token) throw new Error('BOT_TOKEN должен быть указан в .env файле');

const bot = new TelegramBot(token, { polling: true });

// Хранилище состояний пользователей
// { userId: { state: 'waiting_title' | 'waiting_description', data: {} } }
const userStates = {};

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

// Главное меню с кнопками (админ)
function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📌 Добавить ДЗ', callback_data: 'add_homework' }
      ],
      [
        { text: '📚 Список ДЗ', callback_data: 'list_homework' }
      ]
    ]
  };
}

// Меню для тех, у кого нет доступа к добавлению
function getPublicMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '📚 Список ДЗ', callback_data: 'list_homework' }
      ]
    ]
  };
}

// Кнопка "Назад в меню"
function getBackMenuKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: '🔙 Назад в меню', callback_data: 'back_to_menu' }
      ]
    ]
  };
}

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const admin = isAdmin(userId);

  // Очищаем состояние пользователя
  delete userStates[userId];

  if (!admin) {
    bot.sendMessage(
      chatId,
      '👋 Добро пожаловать в StudyCore Bot!\n\n' +
      'У вас только просмотр списка заданий.',
      { reply_markup: getPublicMenuKeyboard() }
    );
    return;
  }

  bot.sendMessage(
    chatId,
    '👋 Добро пожаловать в StudyCore Bot!\n\n' +
    'Выберите действие:',
    { reply_markup: getMainMenuKeyboard() }
  );
});

// Обработка нажатий на кнопки
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;
  const data = query.data;
  const admin = isAdmin(userId);

  // Подтверждаем получение callback
  bot.answerCallbackQuery(query.id);

  // Обработка разных действий
  switch (data) {
    case 'back_to_menu':
      // Очищаем состояние
      delete userStates[userId];

      bot.editMessageText(
        '👋 Главное меню\n\nВыберите действие:',
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: admin ? getMainMenuKeyboard() : getPublicMenuKeyboard()
        }
      );
      break;

    case 'add_homework':
      if (!admin) {
        bot.editMessageText(
          '❌ Добавление заданий доступно только администраторам.',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: getPublicMenuKeyboard()
          }
        );
        return;
      }

      // Начинаем процесс добавления ДЗ
      userStates[userId] = {
        state: 'waiting_title',
        data: {}
      };

      bot.editMessageText(
        '📌 Добавление нового задания\n\n' +
        '👉 Шаг 1/2: Введите заголовок задания\n\n' +
        '💡 Например: "Математика" или "История - Параграф 5"',
        {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: getBackMenuKeyboard()
        }
      );
      break;

    case 'list_homework':
      // Показываем список ДЗ
      try {
        const homeworks = await getAllHomework();

        if (homeworks.length === 0) {
          bot.editMessageText(
            '📭 Пока нет заданий',
            {
              chat_id: chatId,
              message_id: messageId,
              reply_markup: admin ? getBackMenuKeyboard() : getPublicMenuKeyboard()
            }
          );
          return;
        }

        let message = `📚 Всего заданий: ${homeworks.length}\n\n`;

        homeworks.slice(0, 10).forEach((hw, index) => {
          message += `${index + 1}. 📌 ${hw.title}\n`;
          message += `   📄 ${hw.description}\n`;
          message += `   🕒 ${formatDate(hw.created_at)}\n\n`;
        });

        if (homeworks.length > 10) {
          message += `\n... и ещё ${homeworks.length - 10} заданий`;
        }

        bot.editMessageText(message, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: admin ? getBackMenuKeyboard() : getPublicMenuKeyboard()
        });
      } catch (error) {
        console.error('Ошибка при получении списка:', error);
        bot.editMessageText(
          '❌ Ошибка при получении списка заданий',
          {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: admin ? getBackMenuKeyboard() : getPublicMenuKeyboard()
          }
        );
      }
      break;
  }
});

// Обработка текстовых сообщений (для пошагового ввода)
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  // Игнорируем команды
  if (!text || text.startsWith('/')) return;

  if (!isAdmin(userId)) {
    bot.sendMessage(
      chatId,
      '❌ Добавление заданий доступно только администраторам.\n' +
      '📚 Вам доступен только список заданий.',
      { reply_markup: getPublicMenuKeyboard() }
    );
    return;
  }

  const userState = userStates[userId];

  if (!userState) {
    // Если нет активного диалога - показываем меню
    bot.sendMessage(
      chatId,
      '✅ Используйте кнопки меню для управления заданиями:',
      { reply_markup: getMainMenuKeyboard() }
    );
    return;
  }

  // Обработка состояний
  switch (userState.state) {
    case 'waiting_title':
      // Сохраняем заголовок и запрашиваем описание
      userState.data.title = text.trim();
      userState.state = 'waiting_description';

      bot.sendMessage(
        chatId,
        `✅ Заголовок: "${text.trim()}"\n\n` +
        '👉 Шаг 2/2: Введите описание задания\n\n' +
        '💡 Например: "Решить задачи №1-10 на странице 45" или "Выучить параграф 3, ответить на вопросы"',
        { reply_markup: getBackMenuKeyboard() }
      );
      break;

    case 'waiting_description':
      // Сохраняем описание и добавляем ДЗ
      const title = userState.data.title;
      const description = text.trim();

      try {
        const homework = await addHomework(title, description);

        // Очищаем состояние
        delete userStates[userId];

        bot.sendMessage(
          chatId,
          '✅ Задание успешно добавлено!\n\n' +
          `📌 ID: ${homework.id}\n` +
          `📌 ${homework.title}\n` +
          `📄 ${homework.description}\n` +
          `🕒 ${formatDate(homework.created_at)}\n\n` +
          '🌐 Задание появилось на сайте!',
          { reply_markup: getMainMenuKeyboard() }
        );
      } catch (error) {
        console.error('Ошибка при добавлении ДЗ:', error);

        // Очищаем состояние
        delete userStates[userId];

        bot.sendMessage(
          chatId,
          '❌ Ошибка при добавлении задания.\n\n' +
          `Детали: ${error.message}\n\n` +
          'Попробуйте ещё раз:',
          { reply_markup: getMainMenuKeyboard() }
        );
      }
      break;

    default:
      bot.sendMessage(chatId, '❌ Что-то пошло не так. Используйте /start');
      delete userStates[userId];
  }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('🤖 Бот запущен и готов к работе!');
console.log(`👥 Администраторы: ${adminIds.join(', ')}`);
console.log('💡 Используйте /start чтобы начать');
