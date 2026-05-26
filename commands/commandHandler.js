const basicCommands = require('./basicCommands');
const adminCommands = require('./adminCommands');
const funCommands = require('./funCommands');
const utilityCommands = require('./utilityCommands');

const ADMIN_NUMBERS = process.env.ADMIN_NUMBERS?.split(',') || ['254700000000']; // Add your number here

const isAdmin = (sender, adminNumbers) => {
  const senderNumber = sender.split('@')[0];
  return adminNumbers.includes(senderNumber);
};

const handleCommand = async (sock, msg, sender, messageContent, senderName, isGroup) => {
  const command = messageContent.toLowerCase().trim();
  
  // Basic commands (everyone)
  if (command === '!ping') {
    await basicCommands.ping(sock, sender);
  } else if (command === '!hello') {
    await basicCommands.hello(sock, sender, senderName);
  } else if (command.startsWith('!echo ')) {
    const text = messageContent.slice(6);
    await basicCommands.echo(sock, sender, text);
  } else if (command === '!help') {
    await utilityCommands.help(sock, sender);
  } else if (command === '!time') {
    await utilityCommands.time(sock, sender);
  } else if (command === '!joke') {
    await funCommands.joke(sock, sender);
  } else if (command === '!quote') {
    await funCommands.quote(sock, sender);
  } else if (command === '!fact') {
    await funCommands.fact(sock, sender);
  } else if (command === '!dice') {
    await funCommands.dice(sock, sender);
  } else if (command === '!coin') {
    await funCommands.coin(sock, sender);
  }
  
  // Admin commands
  else if (isAdmin(sender, ADMIN_NUMBERS)) {
    if (command === '!admins') {
      await adminCommands.showAdmins(sock, sender, ADMIN_NUMBERS);
    } else if (command === '!groupinfo' && isGroup) {
      await adminCommands.groupInfo(sock, sender);
    } else if (command.startsWith('!broadcast ')) {
      const text = messageContent.slice(11);
      await adminCommands.broadcast(sock, sender, text);
    } else if (command === '!stats') {
      await adminCommands.stats(sock, sender);
    }
  } else if (isGroup && isAdmin(sender, ADMIN_NUMBERS) === false && command.startsWith('!')) {
    // Non-admin trying admin command
    if (command === '!admins' || command === '!groupinfo' || command.startsWith('!broadcast ') || command === '!stats') {
      await sock.sendMessage(sender, { text: '❌ This command is only for admins!' });
    }
  }
};

module.exports = { handleCommand, isAdmin };
