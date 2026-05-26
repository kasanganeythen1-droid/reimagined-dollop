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
    try {
      const msg = m.messages[0];

      if (!msg.message) return;

      const sender = msg.key.remoteJid;
      const messageType = Object.keys(msg.message)[0];
      const messageContent =
        msg.message[messageType]?.text || msg.message[messageType]?.caption || '';

      const isGroup = sender.endsWith('@g.us');
      const senderName = msg.pushName || 'User';

      console.log(`[${isGroup ? 'GROUP' : 'PRIVATE'}] ${senderName}: ${messageContent}`);

      // Import command handlers
      const { handleCommand } = require('./commands/commandHandler');
      
      // Process the message
      await handleCommand(sock, msg, sender, messageContent, senderName, isGroup);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  // Welcome new members
  sock.ev.on('group-participants.update', async (update) => {
    try {
      const { id, participants, action } = update;
      if (action === 'add') {
        const welcomeMsg = `👋 Welcome to the group, ${participants.map(p => '@' + p.split('@')[0]).join(', ')}!\n\nType !help to see available commands.`;
        await sock.sendMessage(id, { text: welcomeMsg, mentions: participants });
      } else if (action === 'remove') {
        console.log(`Members ${participants.join(', ')} left the group`);
      }
    } catch (error) {
      console.error('Error handling group update:', error);
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

startBot().catch(console.error);
