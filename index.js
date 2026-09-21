require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const CHANNEL_USERNAME = process.env.CHANNEL_USERNAME;
const CHANNEL_URL =
  process.env.CHANNEL_URL ||
  `https://t.me/${String(CHANNEL_USERNAME || '').replace('@', '')}`;

if (!TOKEN) {
  console.log('❌ В .env не найден BOT_TOKEN');
  process.exit(1);
}

if (!ADMIN_ID) {
  console.log('❌ В .env не найден ADMIN_ID');
  process.exit(1);
}

if (!CHANNEL_USERNAME) {
  console.log('❌ В .env не найден CHANNEL_USERNAME');
  process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });
const users = new Map();

const servers = {
  1:'RED',2:'GREEN',3:'BLUE',4:'YELLOW',5:'ORANGE',
  6:'PURPLE',7:'LIME',8:'PINK',9:'CHERRY',10:'BLACK',
  11:'INDIGO',12:'WHITE',13:'MAGENTA',14:'CRIMSON',15:'GOLD',
  16:'AZURE',17:'PLATINUM',18:'AQUA',19:'GRAY',20:'ICE',
  21:'CHILLI',22:'CHOCO',23:'MOSCOW',24:'SPB',25:'UFA',
  26:'SOCHI',27:'KAZAN',28:'SAMARA',29:'ROSTOV',30:'ANAPA',
  31:'EKB',32:'KRASNODAR',33:'ARZAMAS',34:'NOVOSIB',35:'GROZNY',
  36:'SARATOV',37:'OMSK',38:'IRKUTSK',39:'VOLGOGRAD',40:'VORONEZH',
  41:'BELGOROD',42:'MAKHACHKALA',43:'VLADIKAVKAZ',44:'VLADIVOSTOK',
  45:'KALININGRAD',46:'CHELYABINSK',47:'KRASNOYARSK',48:'CHEBOKSARY',
  49:'KHABAROVSK',50:'PERM',51:'TULA',52:'RYAZAN',53:'MURMANSK',
  54:'PENZA',55:'KURSK',56:'ARKHANGELSK',57:'ORENBURG',58:'KIROV',
  59:'KEMEROVO',60:'TYUMEN',61:'TOLYATTI',62:'IVANOVO',
  63:'STAVROPOL',64:'SMOLENSK',65:'PSKOV',66:'BRYANSK',67:'OREL',
  68:'YAROSLAVL',69:'BARNAUL',70:'LIPETSK',71:'ULYANOVSK',
  72:'YAKUTSK',73:'TAMBOV',74:'BRATSK',75:'ASTRAKHAN',76:'CHITA',
  77:'KOSTROMA',78:'VLADIMIR',79:'KALUGA',80:'NOVGOROD',
  81:'TAGANROG',82:'VOLOGDA',83:'TVER',84:'TOMSK',85:'IZHEVSK',
  86:'SURGUT',87:'PODOLSK',88:'MAGADAN',89:'CHEREPOVETS',
  90:'NORILSK',91:'ASTANA'
};

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function mainMenu() {
  return {
    reply_markup: {
      keyboard: [
        ['🛒 ПРОДАТЬ АККАУНТ'],
        ['🎮 ПРОДАТЬ ИВ'],
        ['💰 РАСЦЕНКИ'],
        ['ℹ️ ИНФОРМАЦИЯ']
      ],
      resize_keyboard: true
    }
  };
}

function backKeyboard() {
  return {
    reply_markup: {
      keyboard: [['↩️ НАЗАД']],
      resize_keyboard: true
    }
  };
}

function ivTransferKeyboard() {
  return {
    reply_markup: {
      keyboard: [
        ['🔄 TRADE'],
        ['🏪 МАРКЕТПЛЕЙС'],
        ['↩️ НАЗАД']
      ],
      resize_keyboard: true
    }
  };
}

function clearUser(chatId) {
  users.delete(chatId);
}

async function isSubscribed(userId) {
  try {
    const member = await bot.getChatMember(CHANNEL_USERNAME, userId);

    return ['creator', 'administrator', 'member'].includes(member.status);
  } catch (error) {
    console.log('Ошибка проверки подписки:', error.message);
    return false;
  }
}

async function sendStart(chatId) {
  const subscribed = await isSubscribed(chatId);

  if (!subscribed) {
    clearUser(chatId);

    await bot.sendMessage(
      chatId,
      `<b>🤖 FermilBase</b>

👋 <i>Добро пожаловать!</i>

Чтобы пользоваться ботом, необходимо
<b>подписаться на наш Telegram-канал.</b>`,
      {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: '📢 ПОДПИСАТЬСЯ', url: CHANNEL_URL }],
            [{ text: '✅ ПРОВЕРИТЬ ПОДПИСКУ', callback_data: 'check_subscription' }]
          ]
        }
      }
    );

    return;
  }

  clearUser(chatId);

  await bot.sendMessage(
    chatId,
    `<blockquote>✅ <b>Подписка подтверждена!</b></blockquote>

👋 <i>Добро пожаловать в FermilBase.</i>`,
    {
      parse_mode: 'HTML',
      ...mainMenu()
    }
  );
}

bot.onText(/^\/start$/, async (msg) => {
  await sendStart(msg.chat.id);
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data !== 'check_subscription') return;

  const subscribed = await isSubscribed(chatId);

  if (!subscribed) {
    await bot.answerCallbackQuery(query.id, {
      text: '❌ Ты ещё не подписан на канал.',
      show_alert: true
    });
    return;
  }

  await bot.answerCallbackQuery(query.id, {
    text: '✅ Подписка подтверждена!'
  });

  clearUser(chatId);

  await bot.sendMessage(
    chatId,
    `<blockquote>✅ <b>Подписка подтверждена!</b></blockquote>

👋 <i>Добро пожаловать в FermilBase.</i>`,
    {
      parse_mode: 'HTML',
      ...mainMenu()
    }
  );
});

bot.on('message', async (msg) => {
  if (!msg.text && !msg.photo) return;

  const chatId = msg.chat.id;

  if (msg.text === '/start') return;

  const subscribed = await isSubscribed(chatId);

  if (!subscribed) return;

  if (msg.text === '↩️ НАЗАД') {
    clearUser(chatId);

    await bot.sendMessage(
      chatId,
      `<b>🤖 FermilBase</b>

<i>Выбери нужный раздел:</i>`,
      {
        parse_mode: 'HTML',
        ...mainMenu()
      }
    );

    return;
  }

  if (msg.text === '🛒 ПРОДАТЬ АККАУНТ') {
    users.set(chatId, {
      type: 'account',
      step: 'account_level'
    });

    await bot.sendMessage(
      chatId,
      `<b>🛒 ПРОДАЖА АККАУНТА</b>

<i>Шаг 1 из 4</i>

🎮 Напиши уровень аккаунта.

<i>По нашим критериям: уровень от</i> <code>3</code> <i>до</i> <code>8</code>.`,
      {
        parse_mode: 'HTML',
        ...backKeyboard()
      }
    );

    return;
  }

  if (msg.text === '🎮 ПРОДАТЬ ИВ') {
    users.set(chatId, {
      type: 'iv',
      step: 'iv_server'
    });

    await bot.sendMessage(
      chatId,
      `<b>🎮 ПРОДАЖА ИВ</b>

<i>Шаг 1 из 4</i>

🌐 Напиши номер сервера <b>от 1 до 91</b>.`,
      {
        parse_mode: 'HTML',
        ...backKeyboard()
      }
    );

    return;
  }

  if (msg.text === '💰 РАСЦЕНКИ') {
    await bot.sendMessage(
      chatId,
      `<b>💰 РАСЦЕНКИ</b>

👤 <b>АККАУНТЫ БЕЗ ИМУЩЕСТВА</b>

<blockquote><code>3 уровень</code> — <b>10 ₽</b> / <i>5 ⭐</i>
<code>4 уровень</code> — <b>15 ₽</b> / <i>7.5 ⭐</i>
<code>5 уровень</code> — <b>15 ₽</b> / <i>7.5 ⭐</i>
<code>6 уровень</code> — <b>15 ₽</b> / <i>7.5 ⭐</i>
<code>7 уровень</code> — <b>15 ₽</b> / <i>7.5 ⭐</i>
<code>8 уровень</code> — <b>30 ₽</b> / <i>15 ⭐</i></blockquote>

💵 <b>ИВ</b>

<blockquote><code>1kk</code> — <b>15 ₽</b> / <i>7.5 ⭐</i>
<code>5kk</code> — <b>75 ₽</b> / <i>30 ⭐</i>
<code>20kk</code> — <b>300 ₽</b> / <i>150 ⭐</i></blockquote>

🤝 <b>ДОЛГОСРОЧНОЕ СОТРУДНИЧЕСТВО</b>

<blockquote><code>1kk</code> — <b>20 ₽</b>
<code>3 уровень аккаунта</code> — <b>15 ₽</b></blockquote>

⚡ <b>Быстрая покупка</b> без ожидания <i>5 дней</i>.

После решения продать ИВ стараемся провести сделку примерно за <b>30 минут</b>.

<blockquote>⚠️ <i>Если вам предлагают значительно более высокую цену, чем указано здесь, обязательно проверяйте условия сделки и репутацию покупателя.</i></blockquote>`,
      {
        parse_mode: 'HTML',
        ...backKeyboard()
      }
    );

    return;
  }

  if (msg.text === 'ℹ️ ИНФОРМАЦИЯ') {
    await bot.sendMessage(
      chatId,
      `<b>ℹ️ ИНФОРМАЦИЯ</b>

<b>FermilBase</b> — сервис для продажи аккаунтов и ИВ.

📋 <b>Основные требования</b>

• Аккаунты — без привязок
• Уровень аккаунта: <code>3–8</code>
• Желательно без имущества
• Скрин статистики из <code>/mm</code>
• Сервер: <code>1–91</code>

💵 <b>ИВ</b>

• До <code>20кк</code>
• Передача через <b>Trade</b> или <b>Marketplace</b>
• Скрин подтверждения баланса

💳 <b>ВЫПЛАТА</b>

• Российские банки
• Telegram Stars
• Донат в игре, если это технически возможно

<blockquote>⚠️ <i>Всегда проверяйте условия сделки и репутацию покупателя.</i></blockquote>`,
      {
        parse_mode: 'HTML',
        ...backKeyboard()
      }
    );

    return;
  }

  const state = users.get(chatId);

  if (!state) {
    await bot.sendMessage(
      chatId,
      `<b>🤖 FermilBase</b>

<i>Выбери нужный раздел:</i>`,
      {
        parse_mode: 'HTML',
        ...mainMenu()
      }
    );
    return;
  }

  if (state.type === 'account') {

    if (state.step === 'account_level') {
      if (!msg.text || !/^\d+$/.test(msg.text)) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Неверный уровень.</b>

<i>Напиши число от</i> <code>3</code> <i>до</i> <code>8</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const level = Number(msg.text);

      if (level < 3 || level > 8) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Неверный уровень.</b>

<i>Для продажи принимаются аккаунты от</i> <code>3</code> <i>до</i> <code>8</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      state.level = level;
      state.step = 'account_server';

      await bot.sendMessage(
        chatId,
        `✅ <b>Уровень аккаунта:</b> <code>${level}</code>

<i>Шаг 2 из 4</i>

🌐 Напиши номер сервера <b>от 1 до 91</b>.`,
        {
          parse_mode: 'HTML',
          ...backKeyboard()
        }
      );

      return;
    }

    if (state.step === 'account_server') {
      if (!msg.text || !/^\d+$/.test(msg.text)) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Неверный номер сервера.</b>

<i>Напиши число от</i> <code>1</code> <i>до</i> <code>91</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const serverNumber = Number(msg.text);

      if (!servers[serverNumber]) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Такого сервера нет.</b>

<i>Напиши номер от</i> <code>1</code> <i>до</i> <code>91</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      state.serverNumber = serverNumber;
      state.serverName = servers[serverNumber];
      state.step = 'account_property';

      await bot.sendMessage(
        chatId,
        `✅ <b>Сервер №${serverNumber} — ${state.serverName}</b>

<i>Шаг 3 из 4</i>

🏠 Напиши имущество аккаунта.

<i>Например:</i>
<code>Дом, бизнес, BMW M5</code>

<i>Если имущества нет — напиши:</i>
<code>Нет</code>`,
        {
          parse_mode: 'HTML',
          ...backKeyboard()
        }
      );

      return;
    }

    if (state.step === 'account_property') {
      if (!msg.text) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Напиши имущество текстом.</b>

<i>Если имущества нет — напиши</i> <code>Нет</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      state.property = msg.text;
      state.step = 'account_screenshot';

      await bot.sendMessage(
        chatId,
        `✅ <b>Имущество записано.</b>

<i>Шаг 4 из 4</i>

📸 Отправь <b>скриншот статистики аккаунта из</b> <code>/mm</code>.`,
        {
          parse_mode: 'HTML',
          ...backKeyboard()
        }
      );

      return;
    }

    if (state.step === 'account_screenshot') {
      if (!msg.photo) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Нужно отправить именно фотографию.</b>

📸 Отправь скриншот статистики из <code>/mm</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const photo = msg.photo[msg.photo.length - 1].file_id;

      await bot.sendMessage(
        chatId,
        `⏳ <i>Заявка отправляется администрации...</i>`,
        {
          parse_mode: 'HTML'
        }
      );

      const username = msg.from.username
        ? `@${msg.from.username}`
        : 'Не указан';

      const caption =
`📥 <b>НОВЫЙ АККАУНТ</b>

👤 <b>Telegram:</b> <code>${escapeHtml(username)}</code>
🆔 <b>ID:</b> <code>${msg.from.id}</code>

🎮 <b>Уровень:</b> <code>${state.level}</code>
🌐 <b>Сервер:</b> <code>№${state.serverNumber} — ${state.serverName}</code>
🏠 <b>Имущество:</b> <code>${escapeHtml(state.property)}</code>`;

      await bot.sendPhoto(ADMIN_ID, photo, {
caption,
parse_mode: 'HTML',
reply_markup: {
  inline_keyboard: [
    [
      {
        text: '💬 Написать пользователю',
        url: `tg://user?id=${chatId}`
      }
    ]
  ]
}
      });

      clearUser(chatId);

      await bot.sendMessage(
        chatId,
        `<blockquote>✅ <b>Спасибо!</b></blockquote>

Твои данные отправлены администрации.

<i>Ожидай сообщения.</i>`,
        {
          parse_mode: 'HTML',
          ...mainMenu()
        }
      );

      return;
    }
  }

  if (state.type === 'iv') {

    if (state.step === 'iv_server') {
      if (!msg.text || !/^\d+$/.test(msg.text)) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Неверный номер сервера.</b>

<i>Напиши число от</i> <code>1</code> <i>до</i> <code>91</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const serverNumber = Number(msg.text);

      if (!servers[serverNumber]) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Такого сервера нет.</b>

<i>Напиши номер от</i> <code>1</code> <i>до</i> <code>91</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      state.serverNumber = serverNumber;
      state.serverName = servers[serverNumber];
      state.step = 'iv_amount';

      await bot.sendMessage(
        chatId,
        `✅ <b>Сервер №${serverNumber} — ${state.serverName}</b>

<i>Шаг 2 из 4</i>

💰 Напиши количество ИВ.

<i>Максимум —</i> <code>20кк</code>.`,
        {
          parse_mode: 'HTML',
          ...backKeyboard()
        }
      );

      return;
    }

    if (state.step === 'iv_amount') {
      if (!msg.text) return;

      const text = msg.text.trim().toLowerCase();
      const match = text.match(/^(\d+(?:[.,]\d+)?)\s*(кк|kk)$/i);

      if (!match) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Неверный формат.</b>

<i>Напиши количество, например:</i>
<code>10кк</code>
<code>5кк</code>
<code>20кк</code>`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const amount = Number(match[1].replace(',', '.'));

      if (amount <= 0 || amount > 20) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Максимальное количество — 20кк.</b>

<i>Напиши количество от</i> <code>0.1кк</code> <i>до</i> <code>20кк</code>.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      state.amount = `${match[1].replace(',', '.')}кк`;
      state.step = 'iv_transfer';

      await bot.sendMessage(
        chatId,
        `✅ <b>Количество ИВ:</b> <code>${state.amount}</code>

<i>Шаг 3 из 4</i>

📦 Выбери способ передачи:`,
        {
          parse_mode: 'HTML',
          ...ivTransferKeyboard()
        }
      );

      return;
    }

    if (state.step === 'iv_transfer') {
      if (msg.text !== '🔄 TRADE' && msg.text !== '🏪 МАРКЕТПЛЕЙС') {
        await bot.sendMessage(
          chatId,
          `📦 <b>Выбери способ передачи кнопкой ниже.</b>`,
          {
            parse_mode: 'HTML',
            ...ivTransferKeyboard()
          }
        );
        return;
      }

      state.transfer =
        msg.text === '🔄 TRADE'
          ? 'Trade'
          : 'Marketplace';

      state.step = 'iv_screenshot';

      await bot.sendMessage(
        chatId,
        `✅ <b>Способ передачи:</b> <code>${state.transfer}</code>

<i>Шаг 4 из 4</i>

📸 Отправь <b>скриншот из игры</b>, где видно количество денег.`,
        {
          parse_mode: 'HTML',
          ...backKeyboard()
        }
      );

      return;
    }

    if (state.step === 'iv_screenshot') {
      if (!msg.photo) {
        await bot.sendMessage(
          chatId,
          `❌ <b>Нужно отправить именно фотографию.</b>

📸 Отправь скриншот из игры, где видно количество денег.`,
          {
            parse_mode: 'HTML',
            ...backKeyboard()
          }
        );
        return;
      }

      const photo = msg.photo[msg.photo.length - 1].file_id;

      await bot.sendMessage(
        chatId,
        `⏳ <i>Заявка отправляется администрации...</i>`,
        {
          parse_mode: 'HTML'
        }
      );

      const username = msg.from.username
        ? `@${msg.from.username}`
        : 'Не указан';

      const caption =
`📥 <b>НОВАЯ ЗАЯВКА — ИВ</b>

👤 <b>Telegram:</b> <code>${escapeHtml(username)}</code>
🆔 <b>ID:</b> <code>${msg.from.id}</code>

🌐 <b>Сервер:</b> <code>№${state.serverNumber} — ${state.serverName}</code>
💰 <b>Количество:</b> <code>${state.amount}</code>
📦 <b>Передача:</b> <code>${state.transfer}</code>`;

      await bot.sendPhoto(ADMIN_ID, photo, {
caption,
parse_mode: 'HTML',
reply_markup: {
  inline_keyboard: [
    [
      {
        text: '💬 Написать пользователю',
        url: `tg://user?id=${chatId}`
      }
    ]
  ]
}
      });

      clearUser(chatId);

      await bot.sendMessage(
        chatId,
        `<blockquote>✅ <b>Заявка отправлена!</b></blockquote>

Твои данные переданы администрации.

<i>Ожидай сообщения.</i>`,
        {
          parse_mode: 'HTML',
          ...mainMenu()
        }
      );

      return;
    }
  }
});

bot.on('polling_error', (error) => {
  console.log('Polling error:', error.message);
});

console.log('✅ FermilBase бот запущен');
