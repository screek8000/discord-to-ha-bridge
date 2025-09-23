import { Client, Events, GatewayIntentBits } from "discord.js";

// Environment variables are built into Bun
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;
const NTFY_URL = process.env.NTFY_URL;
const NTFY_AUTH_TOKEN = process.env.NTFY_AUTH_TOKEN;

// Validate environment variables
if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error("Missing required environment variables");
  process.exit(1);
}

// Create Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Handle Discord messages
client.on(Events.MessageCreate, async (message) => {
  // Check if message is in the target channel and from the target user
  if (message.channelId === DISCORD_CHANNEL_ID) {
    const NTFY_RESPONSE = await fetch(
      (NTFY_URL as string) + message.author.username,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${NTFY_AUTH_TOKEN}`,
        },
        body: message.content,
      }
    );

    if (!NTFY_RESPONSE.ok) {
      console.error(
        "Failed to send message to NTFY:",
        NTFY_RESPONSE.statusText
      );
    }

    console.log("Successfully sent message to NTFY");
    console.log(NTFY_RESPONSE);
  }
});

// Handle Discord client errors
client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.on(Events.ClientReady, (client) => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Login to Discord
client.login(DISCORD_BOT_TOKEN).catch((error) => {
  console.error("Failed to login to Discord:", error);
  process.exit(1);
});
