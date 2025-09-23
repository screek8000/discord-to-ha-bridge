import { Client, Events, GatewayIntentBits } from "discord.js";

// Configuration
interface Config {
  discord: {
    botToken: string;
    channelId: string;
  };
  ntfy: {
    url: string;
    authToken?: string;
    prefix?: string;
  };
}

// Load and validate configuration
const config: Config = {
  discord: {
    botToken: process.env.DISCORD_BOT_TOKEN || "",
    channelId: process.env.DISCORD_CHANNEL_ID || "",
  },
  ntfy: {
    url: process.env.NTFY_URL || "",
    authToken: process.env.NTFY_AUTH_TOKEN,
    prefix: process.env.NTFY_PREFIX,
  },
};

function validateConfig(config: Config): void {
  const requiredFields = [
    { value: config.discord.botToken, name: "DISCORD_BOT_TOKEN" },
    { value: config.discord.channelId, name: "DISCORD_CHANNEL_ID" },
    { value: config.ntfy.url, name: "NTFY_URL" },
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

// NTFY message handling
async function sendToNtfy(content: string, username: string): Promise<void> {
  const topic = `${config.ntfy.prefix || ""}${username}`;
  const url = `${config.ntfy.url}${topic}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (config.ntfy.authToken) {
      headers.Authorization = `Bearer ${config.ntfy.authToken}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: content,
    });

    if (!response.ok) {
      throw new Error(
        `NTFY responded with status: ${response.status} ${response.statusText}`
      );
    }

    console.log(`Successfully sent message to NTFY topic: ${topic}`);
  } catch (error) {
    console.error("Failed to send message to NTFY:", error);
  }
}

// Discord event handlers
client.on(Events.MessageCreate, async (message) => {
  if (message.channelId === config.discord.channelId) {
    await sendToNtfy(message.content, message.author.username);
  }
});

client.on(Events.Error, (error) => {
  console.error("Discord client error:", error);
});

client.on(Events.ClientReady, (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

// Start the Discord client
client.login(config.discord.botToken).catch((error) => {
  console.error("Failed to login to Discord:", error);
  process.exit(1);
});
