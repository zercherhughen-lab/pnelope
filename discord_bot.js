/**
 * =========================================================================
 *                   BOT OFICIAL DE DISCORD PARA VAPE / VAUTH
 * =========================================================================
 * 
 * Funcionalidades automáticas:
 *  1. /claim <usuario> -> Crea 1 sola licencia por cuenta de Discord con el rol asignado.
 *  2. /resethwid <key> <usuario> -> Resetea el HWID eliminándolo de la base de datos.
 *  3. /mikey -> Consulta tu licencia, estado y HWID.
 *  4. Respuestas efímeras (solo visibles para el usuario por seguridad).
 * 
 * Instrucciones:
 *  1. Instala discord.js y axios: npm install discord.js axios dotenv
 *  2. Configura tu BOT_TOKEN y credenciales abajo o en un archivo .env
 *  3. Inicia el bot: node discord_bot.js
 */

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// CONFIGURACIÓN DE TU SERVICIO VAPE
const CONFIG = {
  API_URL: process.env.VAUTH_API_URL || 'https://pnelope.vercel.app',
  API_KEY: process.env.VAUTH_API_KEY || '69415e37f9f2604ceb4852dc6b00ff1b',
  SECRET_ID: process.env.VAUTH_SECRET_ID || 'sec_e7c1376ec414edc901bfbfc3',
  SERVICE_NAME: process.env.VAUTH_SERVICE || 'Vape',
  
  // DISCORD BOT CONFIG (Del Discord Developer Portal)
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN || 'TU_DISCORD_BOT_TOKEN_AQUI',
  CLIENT_ID: process.env.DISCORD_CLIENT_ID || 'TU_CLIENT_ID_AQUI',
  GUILD_ID: process.env.DISCORD_GUILD_ID || '', // ID de tu servidor de Discord (opcional)

  // ROL EXCLUSIVO REQUERIDO (ID o Nombre del Rol en tu Discord)
  REQUIRED_ROLE_ID: process.env.DISCORD_REQUIRED_ROLE_ID || '', // Ej: '123456789012345678'
  REQUIRED_ROLE_NAME: process.env.DISCORD_REQUIRED_ROLE_NAME || 'Cliente', // Ej: 'Cliente' o 'VIP'
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ]
});

// DEFINICIÓN DE COMANDOS SLASH
const commands = [
  new SlashCommandBuilder()
    .setName('claim')
    .setDescription('Reclama tu licencia y crea tu usuario (1 por cuenta de Discord)')
    .addStringOption(option =>
      option.setName('usuario')
        .setDescription('Elige tu nombre de usuario para el loader')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('resethwid')
    .setDescription('Resetea y desvincula tu HWID para usar tu licencia en una nueva PC')
    .addStringOption(option =>
      option.setName('key')
        .setDescription('Tu clave de licencia (ej. VAP-XXXX-YYYY)')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('usuario')
        .setDescription('Tu nombre de usuario registrado')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('mikey')
    .setDescription('Consulta los datos y estado de tu licencia actual'),
];

// REGISTRO DE COMANDOS SLASH EN DISCORD
async function registerSlashCommands() {
  const rest = new REST({ version: '10' }).setToken(CONFIG.BOT_TOKEN);
  try {
    console.log('[Discord] Registrando comandos Slash (/claim, /resethwid, /mikey)...');
    if (CONFIG.GUILD_ID) {
      await rest.put(
        Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
        { body: commands }
      );
    } else {
      await rest.put(
        Routes.applicationCommands(CONFIG.CLIENT_ID),
        { body: commands }
      );
    }
    console.log('[Discord] ¡Comandos Slash registrados exitosamente!');
  } catch (error) {
    console.error('[Discord] Error registrando comandos:', error.message);
  }
}

client.once('ready', () => {
  console.log(`[Discord] Bot conectado como: ${client.user.tag}`);
  registerSlashCommands();
});

// MANEJADOR DE INTERACCIONES
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user, member } = interaction;

  // 1. COMANDO /claim <usuario>
  if (commandName === 'claim') {
    await interaction.deferReply({ ephemeral: true });

    const chosenUsername = interaction.options.getString('usuario').trim();

    // Obtener los roles del usuario en el servidor
    const userRoleIds = member && member.roles ? Array.from(member.roles.cache.keys()) : [];
    const userRoleNames = member && member.roles ? member.roles.cache.map(r => r.name) : [];

    // Validar Rol Requerido si está configurado
    if (CONFIG.REQUIRED_ROLE_ID || CONFIG.REQUIRED_ROLE_NAME) {
      const hasRequiredRole = userRoleIds.includes(CONFIG.REQUIRED_ROLE_ID) || 
                              userRoleNames.some(name => name.toLowerCase() === CONFIG.REQUIRED_ROLE_NAME.toLowerCase());

      if (!hasRequiredRole) {
        return interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xEF4444)
              .setTitle('❌ Rol Requerido No Encontrado')
              .setDescription(`Para reclamar una licencia necesitas tener el rol **${CONFIG.REQUIRED_ROLE_NAME || CONFIG.REQUIRED_ROLE_ID}** en este servidor de Discord.`)
              .setFooter({ text: 'Vape Security System' })
          ]
        });
      }
    }

    try {
      const response = await axios.post(`${CONFIG.API_URL}/api/v1/discord/claim`, {
        api_key: CONFIG.API_KEY,
        secret_id: CONFIG.SECRET_ID,
        service: CONFIG.SERVICE_NAME,
        discord_user_id: user.id,
        discord_username: user.tag || user.username,
        username: chosenUsername,
        roles: userRoleIds,
        user_roles: userRoleNames,
        duration: 'Lifetime',
        rank: 'VIP'
      });

      const data = response.data;
      if (data.success && data.user) {
        const u = data.user;
        const embed = new EmbedBuilder()
          .setColor(0x10B981)
          .setTitle('🎉 ¡Licencia Creada Exitosamente!')
          .setDescription(`Tu licencia ha sido generada y vinculada exclusivamente a tu cuenta de Discord <@${user.id}>.`)
          .addFields(
            { name: '👤 Usuario Registrado', value: `\`${u.username}\``, inline: true },
            { name: '🔑 Clave de Licencia', value: `\`\`\`${u.license_key}\`\`\``, inline: false },
            { name: '🛡️ Estado HWID', value: '`Sin vincular (Se vinculará al abrir el loader)`', inline: true },
            { name: '⏳ Duración', value: `\`${u.duration}\``, inline: true },
            { name: '🏆 Rango', value: `\`${u.rank}\``, inline: true }
          )
          .setFooter({ text: 'Guarda tu clave en un lugar seguro. Solo tienes 1 licencia permitida.' });

        return interaction.editReply({ embeds: [embed] });
      }

    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xEF4444)
            .setTitle('⚠️ No se pudo generar la licencia')
            .setDescription(detail)
            .setFooter({ text: 'Vape Security System' })
        ]
      });
    }
  }

  // 2. COMANDO /resethwid <key> <usuario>
  if (commandName === 'resethwid') {
    await interaction.deferReply({ ephemeral: true });

    const key = interaction.options.getString('key').trim();
    const username = interaction.options.getString('usuario').trim();

    try {
      const response = await axios.post(`${CONFIG.API_URL}/api/v1/discord/resethwid`, {
        api_key: CONFIG.API_KEY,
        secret_id: CONFIG.SECRET_ID,
        service: CONFIG.SERVICE_NAME,
        discord_user_id: user.id,
        license_key: key,
        username: username
      });

      const data = response.data;
      if (data.success) {
        const embed = new EmbedBuilder()
          .setColor(0x3B82F6)
          .setTitle('🔄 HWID Reseteado Exitosamente')
          .setDescription(`El HWID de tu cuenta **${username}** ha sido eliminado por completo de la base de datos.`)
          .addFields(
            { name: '🔑 Licencia', value: `\`${key}\``, inline: true },
            { name: '🖥️ Nuevo Estado', value: '`Listo para vincular a una nueva PC`', inline: true }
          )
          .setFooter({ text: 'Abre el software en tu nuevo equipo para vincularlo automáticamente.' });

        return interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      return interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xEF4444)
            .setTitle('❌ Error al resetear HWID')
            .setDescription(detail)
        ]
      });
    }
  }

  // 3. COMANDO /mikey
  if (commandName === 'mikey') {
    await interaction.deferReply({ ephemeral: true });

    try {
      const response = await axios.post(`${CONFIG.API_URL}/api/v1/service/query`, {
        api_key: CONFIG.API_KEY,
        secret_id: CONFIG.SECRET_ID,
        service: CONFIG.SERVICE_NAME
      });

      const users = response.data.users || [];
      const myLic = users.find(u => u.username && u.username.toLowerCase() === user.username.toLowerCase());

      if (myLic) {
        const embed = new EmbedBuilder()
          .setColor(0x6366F1)
          .setTitle('📋 Tu Licencia Registrada')
          .addFields(
            { name: '👤 Usuario', value: `\`${myLic.username}\``, inline: true },
            { name: '🔑 Key', value: `\`\`\`${myLic.license_key}\`\`\``, inline: false },
            { name: '🖥️ HWID', value: `\`${myLic.hwid || 'Sin vincular'}\``, inline: true },
            { name: '⚡ Estado', value: `\`${myLic.status}\``, inline: true }
          );
        return interaction.editReply({ embeds: [embed] });
      } else {
        return interaction.editReply({ content: 'No se encontró ninguna licencia vinculada a tu nombre. Usa `/claim <usuario>` para reclamar una.' });
      }
    } catch (err) {
      return interaction.editReply({ content: 'Error al consultar la base de datos de licencias.' });
    }
  }
});

// Iniciar sesión con el Bot Token
if (CONFIG.BOT_TOKEN && CONFIG.BOT_TOKEN !== 'TU_DISCORD_BOT_TOKEN_AQUI') {
  client.login(CONFIG.BOT_TOKEN);
} else {
  console.log('[!] Por favor ingresa tu DISCORD_BOT_TOKEN en discord_bot.js o en tus variables de entorno.');
}
