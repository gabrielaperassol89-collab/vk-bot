const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const TOKEN = process.env.TOKEN;

const STAFF_ROLE_ID = '1498732345350684724';
const CATEGORY_ID = '1498722891347529900';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('clientReady', () => {
  console.log(`Bot online como ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand() && interaction.commandName === 'painel') {
      const botao = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('abrir_ticket_vk')
          .setLabel('🏴 Entrar na VK')
          .setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setTitle('🏴 Recrutamento VK')
        .setDescription('Clique no botão abaixo para abrir seu ticket de recrutamento.')
        .setColor(0xff0000);

      await interaction.reply({
        embeds: [embed],
        components: [botao],
      });

      return;
    }

    if (interaction.isButton() && interaction.customId === 'abrir_ticket_vk') {
      await interaction.deferReply({ ephemeral: true });

      const existing = interaction.guild.channels.cache.find(
        c =>
          c.name === `recrutamento-${interaction.user.username}`.toLowerCase() &&
          c.parentId === CATEGORY_ID
      );

      if (existing) {
        await interaction.editReply({
          content: `Você já tem um ticket aberto: ${existing}`,
        });
        return;
      }

      const ticket = await interaction.guild.channels.create({
        name: `recrutamento-${interaction.user.username}`.toLowerCase(),
        type: ChannelType.GuildText,
        parent: CATEGORY_ID,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionsBitField.Flags.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ],
          },
          {
            id: STAFF_ROLE_ID,
            allow: [
              PermissionsBitField.Flags.ViewChannel,
              PermissionsBitField.Flags.SendMessages,
              PermissionsBitField.Flags.ReadMessageHistory
            ],
          },
        ],
      });

      const fechar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('fechar_ticket_vk')
          .setLabel('🔒 Fechar ticket')
          .setStyle(ButtonStyle.Secondary)
      );

      const mensagem = new EmbedBuilder()
        .setTitle('📥 Recrutamento VK')
        .setDescription(
          `Olá, <@${interaction.user.id}>!\n\n` +
          `Conte sua história no RP e sua experiência.\n\n` +
          `Se você for criador de conteúdo, envie também:\n` +
          `• Links\n` +
          `• Plataformas\n` +
          `• Frequência de lives/postagens\n\n` +
          `Aguarde a Staff analisar seu ticket.`
        )
        .setColor(0xff0000);

      await ticket.send({
        content: `<@${interaction.user.id}> <@&${STAFF_ROLE_ID}>`,
        embeds: [mensagem],
        components: [fechar],
      });

      await interaction.editReply({
        content: `✅ Ticket criado: ${ticket}`,
      });

      return;
    }

    if (interaction.isButton() && interaction.customId === 'fechar_ticket_vk') {
      await interaction.reply('🔒 Fechando ticket em 5 segundos...');

      setTimeout(() => {
        interaction.channel.delete().catch(console.error);
      }, 5000);

      return;
    }
  } catch (error) {
    console.error(error);

    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({
          content: '❌ Ocorreu um erro ao executar essa ação.',
        }).catch(() => {});
      } else {
        await interaction.reply({
          content: '❌ Ocorreu um erro ao executar essa ação.',
          ephemeral: true,
        }).catch(() => {});
      }
    }
  }
});

client.login(TOKEN);