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
  '🇯🇵': 'JA',
  '🇺🇸': 'EN-US',
  '🇫🇷': 'FR',
  '🇩🇪': 'DE',
  '🇪🇸': 'ES',
  '🇵🇹': 'PT-PT',
  '🇧🇷': 'PT-BR',
  '🇮🇹': 'IT',
  '🇷🇺': 'RU',
  '🇨🇳': 'ZH'
};

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
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
