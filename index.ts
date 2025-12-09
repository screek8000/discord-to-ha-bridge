import { Client, Events, GatewayIntentBits } from "discord.js";

// Configuration
interface Config {
  discord: {
    botToken: string;
    channelId: string;
  };
  ha: {
    url: string;
  };
}

// Load and validate configuration
const config: Config = {
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN || "",
    channelId: process.env.DISCORD_CHANNEL_ID || "",
  },
  ha: {
    url: process.env.HA_WEBHOOK_URL || "",
  },
};

function validateConfig(config: Config): void {
  const requiredFields = [
    { value: config.discord.botToken, name: "DISCORD_BOT_TOKEN" },
    { value: config.discord.channelId, name: "DISCORD_CHANNEL_ID" },
    { value: config.ha.url, name: "HA_WEBHOOK_URL" },
  ];

  const missingFields = requiredFields
    .filter((field) => !field.value)
    .map((field) => field.name);

  if (missingFields.length > 0) {
    console.error(
      `Missing required environment variables: ${missingFields.join(", ")}`
    );
    process.exit(1);
  }
}

// Validate configuration before proceeding
validateConfig(config);

// Create Discord client with required intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// HA message handling
async function sendToHa(content: string, username: string): Promise<void> {
  const url = `${config.ha.url}`;
  const json = { "message": content, "user": username };

  try {

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(json)
    });

    if (!response.ok) {
      throw new Error(
        `HA responded with status: ${response.status} ${response.statusText}`
      );
    }

    console.log(`Successfully sent message to HA for user: ${username}`);
  } catch (error) {
    console.error("Failed to send message to HA:", error);
  }
}

// Discord event handlers
client.on(Events.MessageCreate, async (message) => {
  if (message.channelId === config.discord.channelId) {
    await sendToHa(message.content, message.author.username);
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.on(Events.ClientReady, (c) => {
  console.log(`Logged in to Discord as ${c.user.tag}`);
});

// Start the Discord client
client.login(config.discord.botToken).catch((error) => {
  console.error("Failed to login to Discord:", error);
  process.exit(1);
});
