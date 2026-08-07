"""
=========================================================================
            BOT OFICIAL DE DISCORD PARA VAPE / VAUTH (PYTHON)
=========================================================================

Requisitos:
    pip install discord.py requests

Comandos Slash incluidos:
    /claim <usuario>        - Crea tu usuario y genera tu licencia (1 por cuenta)
    /resethwid <key> <user> - Elimina el HWID para vincular un nuevo PC
    /mikey                  - Muestra tu clave y estado
"""

import discord
from discord import app_commands
import requests

# CONFIGURACIÓN DE TU SERVICIO VAPE
API_URL = "https://pnelope.vercel.app"
API_KEY = "69415e37f9f2604ceb4852dc6b00ff1b"
SECRET_ID = "sec_e7c1376ec414edc901bfbfc3"
SERVICE_NAME = "Vape"

# CONFIGURACIÓN DEL BOT DE DISCORD (Del Discord Developer Portal)
BOT_TOKEN = "TU_DISCORD_BOT_TOKEN_AQUI"
REQUIRED_ROLE_NAME = "Cliente"  # Nombre o ID del Rol obligatorio en tu Discord

intents = discord.Intents.default()
intents.members = True
client = discord.Client(intents=intents)
tree = app_commands.CommandTree(client)


@client.event
async def on_ready():
    await tree.sync()
    print(f"[Discord] Bot conectado exitosamente como: {client.user}")


# 1. COMANDO /claim <usuario>
@tree.command(name="claim", description="Reclama tu licencia y crea tu usuario (1 sola por cuenta)")
@app_commands.describe(usuario="Elige el nombre de usuario que usarás en el loader")
async def claim(interaction: discord.Interaction, usuario: str):
    await interaction.response.defer(ephemeral=True)

    # Validar Rol Requerido
    if REQUIRED_ROLE_NAME:
        member = interaction.user
        has_role = any(r.name.lower() == REQUIRED_ROLE_NAME.lower() or str(r.id) == REQUIRED_ROLE_NAME for r in getattr(member, 'roles', []))
        if not has_role:
            embed = discord.Embed(
                title="❌ Rol Requerido No Encontrado",
                description=f"Para reclamar una licencia necesitas tener el rol **{REQUIRED_ROLE_NAME}** en este servidor.",
                color=0xEF4444
            )
            return await interaction.followup.send(embed=embed, ephemeral=True)

    payload = {
        "api_key": API_KEY,
        "secret_id": SECRET_ID,
        "service": SERVICE_NAME,
        "discord_user_id": str(interaction.user.id),
        "discord_username": str(interaction.user),
        "username": usuario.strip(),
        "duration": "Lifetime",
        "rank": "VIP"
    }

    try:
        res = requests.post(f"{API_URL}/api/v1/discord/claim", json=payload, timeout=10)
        data = res.json()

        if res.status_code == 200 and data.get("success"):
            u = data.get("user", {})
            embed = discord.Embed(
                title="🎉 ¡Licencia Creada Exitosamente!",
                description=f"Tu licencia ha sido generada y vinculada a tu cuenta de Discord <@{interaction.user.id}>.",
                color=0x10B981
            )
            embed.add_field(name="👤 Usuario Registrado", value=f"`{u.get('username')}`", inline=True)
            embed.add_field(name="🔑 Clave de Licencia", value=f"```{u.get('license_key')}```", inline=False)
            embed.add_field(name="🛡️ Estado HWID", value="`Sin vincular (Se vinculará al abrir el loader)`", inline=True)
            embed.add_field(name="⏳ Duración", value=f"`{u.get('duration')}`", inline=True)
            embed.set_footer(text="Solo se permite 1 licencia por cuenta de Discord.")
            return await interaction.followup.send(embed=embed, ephemeral=True)
        else:
            detail = data.get("detail", "Error al procesar la solicitud.")
            embed = discord.Embed(
                title="⚠️ No se pudo generar la licencia",
                description=detail,
                color=0xEF4444
            )
            return await interaction.followup.send(embed=embed, ephemeral=True)

    except Exception as e:
        return await interaction.followup.send(content=f"Error de conexión con la API: {e}", ephemeral=True)


# 2. COMANDO /resethwid <key> <usuario>
@tree.command(name="resethwid", description="Resetea tu HWID para poder usar tu key en una nueva PC")
@app_commands.describe(key="Tu clave de licencia (ej. VAP-XXXX-YYYY)", usuario="Tu nombre de usuario registrado")
async def resethwid(interaction: discord.Interaction, key: str, usuario: str):
    await interaction.response.defer(ephemeral=True)

    payload = {
        "api_key": API_KEY,
        "secret_id": SECRET_ID,
        "service": SERVICE_NAME,
        "discord_user_id": str(interaction.user.id),
        "license_key": key.strip(),
        "username": usuario.strip()
    }

    try:
        res = requests.post(f"{API_URL}/api/v1/discord/resethwid", json=payload, timeout=10)
        data = res.json()

        if res.status_code == 200 and data.get("success"):
            embed = discord.Embed(
                title="🔄 HWID Reseteado Exitosamente",
                description=f"El HWID de tu cuenta **{usuario}** ha sido eliminado por completo de la base de datos.",
                color=0x3B82F6
            )
            embed.add_field(name="🔑 Licencia", value=f"`{key}`", inline=True)
            embed.add_field(name="🖥️ Estado", value="`Listo para vincular a tu nueva PC`", inline=True)
            embed.set_footer(text="Abre el software en tu nuevo equipo para vincularlo automáticamente.")
            return await interaction.followup.send(embed=embed, ephemeral=True)
        else:
            detail = data.get("detail", "No se pudo resetear el HWID.")
            embed = discord.Embed(title="❌ Error al resetear HWID", description=detail, color=0xEF4444)
            return await interaction.followup.send(embed=embed, ephemeral=True)

    except Exception as e:
        return await interaction.followup.send(content=f"Error al conectar con la API: {e}", ephemeral=True)


if __name__ == "__main__":
    if BOT_TOKEN and BOT_TOKEN != "TU_DISCORD_BOT_TOKEN_AQUI":
        client.run(BOT_TOKEN)
    else:
        print("[!] Por favor ingresa tu BOT_TOKEN del Discord Developer Portal en discord_bot.py")
