const { Client, GatewayIntentBits, Partials } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();
require('./keep_alive.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel],
});

const emojiLangMap = {
  '🇯🇵': 'JA',      // Japanese
  '🇺🇸': 'EN-US',   // English (US)
  '🇬🇧': 'EN-GB',   // English (UK)
  '🇫🇷': 'FR',      // French
  '🇩🇪': 'DE',      // German
  '🇪🇸': 'ES',      // Spanish
  '🇵🇹': 'PT-PT',   // Portuguese (Portugal)
  '🇧🇷': 'PT-BR',   // Portuguese (Brazil)
  '🇮🇹': 'IT',      // Italian
  '🇷🇺': 'RU',      // Russian
  '🇨🇳': 'ZH',      // Chinese (Simplified)
  '🇺🇦': 'UK',      // Ukrainian
  '🇹🇷': 'TR',      // Turkish
  '🇸🇪': 'SV',      // Swedish
  '🇸🇰': 'SK',      // Slovak
  '🇸🇮': 'SL',      // Slovenian
  '🇷🇴': 'RO',      // Romanian
  '🇵🇱': 'PL',      // Polish
  '🇱🇹': 'LT',      // Lithuanian
  '🇱🇻': 'LV',      // Latvian
  '🇭🇺': 'HU',      // Hungarian
  '🇬🇷': 'EL',      // Greek
  '🇫🇮': 'FI',      // Finnish
  '🇪🇪': 'ET',      // Estonian
  '🇩🇰': 'DA',      // Danish
  '🇨🇿': 'CS',      // Czech
  '🇧🇬': 'BG',      // Bulgarian
  '🇮🇩': 'ID',      // Indonesian
  '🇳🇱': 'NL'       // Dutch
};

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!languages') {
    const languageList = {
      '🇯🇵': 'Japanese',
      '🇺🇸': 'English (US)',
      '🇬🇧': 'English (UK)',
      '🇫🇷': 'French',
      '🇩🇪': 'German',
      '🇪🇸': 'Spanish',
      '🇵🇹': 'Portuguese (Portugal)',
      '🇧🇷': 'Portuguese (Brazil)',
      '🇮🇹': 'Italian',
      '🇷🇺': 'Russian',
      '🇨🇳': 'Chinese (Simplified)',
      '🇺🇦': 'Ukrainian',
      '🇹🇷': 'Turkish',
      '🇸🇪': 'Swedish',
      '🇸🇰': 'Slovak',
      '🇸🇮': 'Slovenian',
      '🇷🇴': 'Romanian',
      '🇵🇱': 'Polish',
      '🇱🇹': 'Lithuanian',
      '🇱🇻': 'Latvian',
      '🇭🇺': 'Hungarian',
      '🇬🇷': 'Greek',
      '🇫🇮': 'Finnish',
      '🇪🇪': 'Estonian',
      '🇩🇰': 'Danish',
      '🇨🇿': 'Czech',
      '🇧🇬': 'Bulgarian',
      '🇮🇩': 'Indonesian',
      '🇳🇱': 'Dutch'
    };

    const formatted = Object.entries(languageList)
      .map(([emoji, lang]) => `${emoji} - ${lang}`)
      .join('\n');

    await message.reply({
      content: `🌐 **Supported Languages:**\n${formatted}`
    });
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  // Fetch full reaction if partial
  if (reaction.partial) {
    try {
      await reaction.fetch();
    } catch (err) {
      console.error('Error fetching reaction:', err);
      return;
    }
  }

  const emoji = reaction.emoji.name;
  const lang = emojiLangMap[emoji];
  if (!lang) return;

  const message = reaction.message;
  const originalText = message.content;

  try {
    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: originalText,
        target_lang: lang
      })
    });

    const data = await res.json();
    const translated = data.translations?.[0]?.text;

    if (translated) {
  await message.reply({
    content: `🔁 **${lang} translation by ${user}:**\n> ${originalText}\n\n**Translation:** ${translated}`
  });
} else {
  await message.reply("⚠️ Translation failed.");
    }
  } catch (err) {
    console.error("Translation error:", err);
    await message.reply("⚠️ An error occurred during translation.");
  }
});

client.login(process.env.DISCORD_TOKEN);
