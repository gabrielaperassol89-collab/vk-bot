const { REST, Routes, SlashCommandBuilder } = require('discord.js');

const commands = [
  new SlashCommandBuilder()
    .setName('painel')
    .setDescription('Abrir painel de recrutamento'),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

(async () => {
  try {
    console.log('Registrando comandos...');

    await rest.put(
      Routes.applicationCommands('1498725457758261248'),
      { body: commands },
    );

    console.log('Comandos registrados com sucesso!');
  } catch (error) {
    console.error(error);
  }
})();