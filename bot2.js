const { Client, GatewayIntentBits, Partials, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();
require('./keep_alive.js'); // Remove if you don't use this

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.Channel],
});

// Full emoji to language code map with flag emoji for display
const emojiLangMap = {
  '🇯🇵': { code: 'JA', name: 'Japanese', emoji: '🇯🇵' },
  '🇺🇸': { code: 'EN-US', name: 'English (US)', emoji: '🇺🇸' },
  '🇬🇧': { code: 'EN-GB', name: 'English (UK)', emoji: '🇬🇧' },
  '🇫🇷': { code: 'FR', name: 'French', emoji: '🇫🇷' },
  '🇩🇪': { code: 'DE', name: 'German', emoji: '🇩🇪' },
  '🇪🇸': { code: 'ES', name: 'Spanish', emoji: '🇪🇸' },
  '🇮🇹': { code: 'IT', name: 'Italian', emoji: '🇮🇹' },
  '🇳🇱': { code: 'NL', name: 'Dutch', emoji: '🇳🇱' },
  '🇵🇹': { code: 'PT-PT', name: 'Portuguese (Portugal)', emoji: '🇵🇹' },
  '🇧🇷': { code: 'PT-BR', name: 'Portuguese (Brazil)', emoji: '🇧🇷' },
  '🇷🇺': { code: 'RU', name: 'Russian', emoji: '🇷🇺' },
  '🇵🇱': { code: 'PL', name: 'Polish', emoji: '🇵🇱' },
  '🇹🇷': { code: 'TR', name: 'Turkish', emoji: '🇹🇷' },
  '🇨🇿': { code: 'CS', name: 'Czech', emoji: '🇨🇿' },
  '🇸🇰': { code: 'SK', name: 'Slovak', emoji: '🇸🇰' },
  '🇨🇳': { code: 'ZH', name: 'Chinese (Simplified)', emoji: '🇨🇳' },
  '🇭🇺': { code: 'HU', name: 'Hungarian', emoji: '🇭🇺' },
  '🇰🇷': { code: 'KO', name: 'Korean', emoji: '🇰🇷' },
  '🇷🇴': { code: 'RO', name: 'Romanian', emoji: '🇷🇴' },
  '🇩🇰': { code: 'DA', name: 'Danish', emoji: '🇩🇰' },
  '🇸🇪': { code: 'SV', name: 'Swedish', emoji: '🇸🇪' },
  '🇧🇬': { code: 'BG', name: 'Bulgarian', emoji: '🇧🇬' },
  '🇺🇦': { code: 'UK', name: 'Ukrainian', emoji: '🇺🇦' },
  '🇮🇩': { code: 'ID', name: 'Indonesian', emoji: '🇮🇩' },
  '🇳🇴': { code: 'NO', name: 'Norwegian', emoji: '🇳🇴' },
  '🇮🇳': { code: 'HI', name: 'Hindi', emoji: '🇮🇳' },
  '🇹🇭': { code: 'TH', name: 'Thai', emoji: '🇹🇭' },
  '🇻🇳': { code: 'VI', name: 'Vietnamese', emoji: '🇻🇳' },
  // Add more if needed
};

client.on('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Command handler for !languages
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!languages') {
    let langList = '';
    for (const [emoji, info] of Object.entries(emojiLangMap)) {
      langList += `${emoji} — **${info.name}** (\`${info.code}\`)\n`;
    }
    return message.channel.send(`**Supported languages:**\n${langList}`);
  }
});

// Reaction translation handler
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
  const langData = emojiLangMap[emoji];
  if (!langData) return;

  const lang = langData.code;
  const flag = langData.emoji;

  const message = reaction.message;
  const originalText = message.content;

  if (!originalText) {
    // Optionally skip if no content to translate
    return;
  }

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
      const embed = new EmbedBuilder()
        .setColor(0x1D9BF0) // Light blue color
        .setAuthor({ name: `Translation requested by ${user.username}`, iconURL: user.displayAvatarURL() })
        .setTitle(`🔁 ${flag} ${lang} Translation`)
        .addFields(
          { name: 'Original', value: originalText || 'N/A' },
          { name: 'Translated', value: translated || 'Translation failed.' }
        );

      // Send standalone message tagging the reacting user, no reply
      await message.channel.send({ content: `<@${user.id}>`, embeds: [embed] });
    } else {
      await message.channel.send({ content: `<@${user.id}> ⚠️ Translation failed.` });
    }
  } catch (err) {
    console.error("Translation error:", err);
    await message.channel.send({ content: `<@${user.id}> ⚠️ An error occurred during translation.` });
  }
});

client.login(process.env.DISCORD_TOKEN);
