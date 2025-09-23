# ntfy-bridge

A Discord to NTFY message bridge that forwards messages from a specific Discord channel to NTFY.

## Environment Variables

The following environment variables are required:

- `DISCORD_BOT_TOKEN`: Your Discord bot token
- `DISCORD_CHANNEL_ID`: The ID of the Discord channel to monitor
- `NTFY_URL`: The base URL of your NTFY server
- `NTFY_AUTH_TOKEN`: Authentication token for NTFY (optional)
