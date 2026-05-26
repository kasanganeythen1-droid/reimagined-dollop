# WhatsApp Bot

A WhatsApp bot built with Baileys library for Node.js.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the bot:**
   ```bash
   npm start
   ```

3. **Scan QR Code:**
   - Open WhatsApp on your phone
   - Go to Settings → Linked Devices → Link a Device
   - Scan the QR code displayed in the terminal

## Features

- Responds to basic commands
- `!ping` - Responds with "Pong!"
- `!hello` - Greets the user
- `!echo <text>` - Repeats the text

## Development

For development with auto-restart:
```bash
npm run dev
```

## Project Structure

```
src/
├── index.js          # Main bot file
commands/            # Command handlers (optional)
auth_info_baileys/   # Authentication files (auto-generated, don't commit)
```

## License

Apache License 2.0
