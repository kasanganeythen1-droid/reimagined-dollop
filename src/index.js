const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('QR Code received, scan with WhatsApp:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const shouldReconnect =
        lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log(
        'Connection closed. Reason:',
        lastDisconnect?.error,
        ', Reconnecting:',
        shouldReconnect
      );

      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('✅ Bot connected to WhatsApp!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];

    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const messageType = Object.keys(msg.message)[0];
    const messageContent =
      msg.message[messageType].text || msg.message[messageType].caption || '';

    console.log(`Message from ${sender}: ${messageContent}`);

    // Bot commands
    if (messageContent.toLowerCase() === '!ping') {
      await sock.sendMessage(sender, { text: '🏓 Pong!' });
    }

    if (messageContent.toLowerCase() === '!hello') {
      await sock.sendMessage(sender, { text: '👋 Hello! How can I help you?' });
    }

    if (messageContent.toLowerCase().startsWith('!echo ')) {
      const echoText = messageContent.slice(6);
      await sock.sendMessage(sender, { text: echoText });
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

startBot().catch(console.error);
