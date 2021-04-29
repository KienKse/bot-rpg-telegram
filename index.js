require("dotenv").config();
const { performance } = require('perf_hooks');
const request = require('request');
const bot = require('./singletonBot');
const staticInfo = require('./db/staticInfo.json');

const { getUser, createUser, deleteUser } = require("./db/database");

var fs = require('fs');
const Player = require('./src/model/player');
var criticalFiles = fs.readdirSync('./assets/sticker/critical');
var criticalFailFiles = fs.readdirSync('./assets/sticker/criticalFail');

const PREFIX = '/';
const criticDice = 20;
const missDice = 1;
const signature = 'Requested by: @';
const criticResult = 'Acerto Crítico! @';
const faliureCriticResult = 'Falha Crítica! @';

bot.onText(/\/(ra(c|ç)a|classe)/, (message) => {
  bot.sendMessage(chatId(message), 'O comando foi alterado para\n/personagem ou /generate seguido do nome do personagem');
});

bot.onText(/\/info personagem/, async (message) => {
  let player = await getUser(message.from.username);
  if(player) {
    bot.sendMessage(chatId(message), formatCharacterOutPut(player));
  } else {
    bot.sendMessage(chatId(message), "Desculpe... não encontrei nenhum personagem com seus dados por aqui.");
  }
});

bot.onText(/\/deletePersonagem @\w+/, async (message) => {
  if(message.from.username == "kienkse") {
    let userName = message.text.replace(/\/deletePersonagem @/,"");
    let player = await deleteUser(userName);
    if(player) {
      bot.sendMessage(chatId(message), "Personagem deletado com sucesso!");
    } else {
      bot.sendMessage(chatId(message), "Não encontrei o usuário!");
    }
  }
});

bot.onText(/\/(personagem|generate) \w+/, async (message) => {
  let nomeChar = message.text.replace(/\/(personagem|generate) /,"");
  let player = await getUser(message.from.username);
  if(player) {
    bot.sendMessage(chatId(message), "Personagem encontrado!");
  } else {

    player = new Player(
      message.from.username,
      nomeChar, 
      pickARandomStringFromList(staticInfo.Class), 
      pickARandomStringFromList(staticInfo.Breed)
      );

    await createUser(player);

    await bot.sendMessage(chatId(message), pickARandomStringFromList(staticInfo.NewMessagesAdventures));
  }

  bot.sendMessage(chatId(message), formatCharacterOutPut(player));
});

bot.onText(/\/ping/, (message) => {
  var start = performance.now()
  var end = performance.now();
  const resp = `Poong!\nIsso levou: ${(end - start).toFixed(4)} milissegundos`;
  bot.sendMessage(chatId(message), resp);
});

bot.onText(/\/caracoroa/, function (message) {
  const resp = (Math.floor(Math.random() * 2) == 0) ? 'Cara' : 'Coroa';
  bot.sendMessage(chatId(message), `Seu resultado é: ${resp}`);
});

bot.onText(/\/r (\d+)d(\d+)/, (message) => {
  message.text = message.text.replace("r ", "");

  let rollInfo = removeBar(message.text).split('d');
  let sortedDices = [];
  const sideNumber = rollInfo[1];
  let criticIndexs = 0;

  while(rollInfo[0] != 0) {
    let result = randomIntFromInterval(1, sideNumber);
    criticIndexs += verifyCritic(sideNumber, result);
    sortedDices.push(result);
    rollInfo[0]--;
  }

  const writedOutPut = `${sortedDices.join(' + ')}`;
  const result = `${eval(sortedDices.join('+'))}`;

  validIndexCritic(criticIndexs, message);

  bot.sendMessage(chatId(message), formatDiceOutPut(writedOutPut, result), replyToSender(message));
});

bot.onText(/\/delete (\d)/, (message) => {
  let cont = message.text.split(" ")[1];
  while(cont != 0) {
        bot.deleteMessage(chatId, message.message_id-cont)
        .catch( () => {
          console.log(`No messages found with id ${message.message_id-cont}`);
          cont--;
        });
        cont--;
  }
  bot.deleteMessage(chatId(message), message.message_id);
});

bot.onText(/\/start/, function onPhotoText(message) {
  // From file path
  const photo = './assets/sticker/greetings.gif';
  bot.sendAnimation(chatId(message), photo, {
    caption: "Saudações!"
  });
});

bot.onText(/\/sticker/, function onPhotoText(message) {
  const url = message.text.split(" ")[1];

  bot.deleteMessage(chatId(message), message.message_id);

  const photo = request(url);

  switch(url.substring(url.lastIndexOf('.') + 1)) {
    case 'png','webp':
      bot.sendSticker(chatId(message), photo, imageSignature(signature, message));
      break;
    case 'gif':
      bot.sendAnimation(chatId(message), photo, imageSignature(signature, message));
      break;
    default:
      bot.sendPhoto(chatId(message), photo, imageSignature(signature, message));
      // bot.sendMessage(chatId(message), "Que diabo de formato é esse?");
      break;
  }
});

bot.onText(/\/audio/, function onAudioText(message) {
  const url = 'https://freesound.org/data/previews/391/391552_3268195-lq.mp3';
  const audio = request(url);
  bot.sendAudio(message.chat.id, audio);
});

const chatId = (message) => {
  return message.chat.id;
}

function validIndexCritic(index, message) {
  let photo = '';
  if (index >= 1) {
    photo = pickARandomImageFromFolder(criticalFiles);
    bot.sendPhoto(chatId(message), `./assets/sticker/critical/${photo}`, imageSignature(criticResult, message));
  } else if (index < 0) {
    photo = pickARandomImageFromFolder(criticalFailFiles);
    bot.sendPhoto(chatId(message), `./assets/sticker/criticalFail/${photo}`, imageSignature(faliureCriticResult, message));
  }
}

function pickARandomImageFromFolder(folder) {
  return folder[randomIntFromInterval(0, (folder.length - 1))];
}

function removeBar(text) {
  return text.replace(PREFIX,'');
}

function formatDiceOutPut(rollingDices, result) {
  if(rollingDices.split(" ").length == 1) {
    return `${result}`;
  } else {
    return `${rollingDices} = ${result}`;
  }
}

function randomIntFromInterval(min, max) {
  return (Math.floor(Math.random() * max)) + min;
}

function imageSignature(signature, message) {
  return { caption: `${signature}${message.from.username}` };
}

function verifyCritic(sideNumber, result) {
  if(sideNumber == criticDice) {
    if(result == criticDice) {
      return 1;
    } else if(result == missDice) {
      return -1;
    }
    return 0;
  }
}

function replyToSender(message) {
  return {reply_to_message_id: message.message_id};
}

function pickARandomStringFromList(list) {
  return list[randomIntFromInterval(0, list.length)].toUpperCase();
}

function formatCharacterOutPut(character) {
  return `@${character._username}:
  Nome: ${character._charName}
  Raça: ${character._breed}
  Classe:  ${character._class}`;
}

require('./web')(bot);