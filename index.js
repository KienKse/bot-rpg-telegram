const TelegramBot = require( `node-telegram-bot-api` );
const { performance } = require('perf_hooks');
const request = require('request');

require("dotenv").config();

const PREFIX = '/';

console.log("\nTOKEN: ", process.env.TOKEN,"\n")
const TOKEN = process.env.TOKEN;
const bot = new TelegramBot( TOKEN, { polling: true } );

var start;

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(chatId, 'Olá :)\nComando não reconhecido');
// });

bot.onText(/ping/, (msg) => {
  start = performance.now()

  const chatId = msg.chat.id;

  var end = performance.now();
  const resp = `Poong!\nIsso levou: ${end - start} milissegundos`;
  bot.sendMessage(chatId, resp);
});

bot.onText(/caracoroa/, (msg) => {
  const chatId = msg.chat.id;

  const resp = (Math.floor(Math.random() * 2) == 0) ? 'Verdade' : 'Falso';
  bot.sendMessage(chatId, `Seu resultado é: ${resp}`);
});

bot.onText(/roll (\d+)d(\d+)/, (msg) => {
  const chatId = msg.chat.id;

  msg.text = msg.text.replace("roll ", "");

  let rollInfo = removeBar(msg.text).split('d');
  let sortedDices = [];

  while(rollInfo[0] != 0) {
    sortedDices.push(Math.floor((Math.random() * rollInfo[1]) + 1));
    rollInfo[0]--;
  }

  const writedOutPut = `${sortedDices.join(' + ')}`;
  const result = `${eval(sortedDices.join('+'))}`;

  bot.sendMessage(chatId, formatDiceOutPut(writedOutPut, result), {reply_to_message_id: msg.message_id});
});

// bot.onText(/\/comandos/, function onLoveText(msg) {
//   const opts = {
//     reply_to_message_id: msg.message_id,
//     reply_markup: JSON.stringify({
//       keyboard: [
//         ['/ping'],
//         ['/1d6'],
//       ]
//     })
//   };
//   bot.sendMessage(msg.chat.id, 'Qual comando quer usar?', opts);
// });

bot.onText(/delete (\d)/, function onPhotoText(msg) {
  const chatId = msg.chat.id;
  let cont = msg.text.split(" ")[1];
  while(cont != 0) {
        bot.deleteMessage(chatId, msg.message_id-cont)
        // .then((response) => {
        //   console.log("Response: ", response);
        // })
        .catch( () => {
          console.log("no messages found with id ", msg.message_id-cont);
          cont--;
        });
        cont--;
  }
  bot.deleteMessage(chatId, msg.message_id);
});

//TODO : REFACTOR TO ONLY 'ADMIND' ROLE
bot.onText(/start/, function onPhotoText(msg) {
  const chatId = msg.chat.id;

  // From file path
  const photo = './assets/sticker/greetings.gif';
  bot.sendAnimation(chatId, photo, {
    caption: "Saudações!"
  });
});

bot.onText(/\/sticker/, function onPhotoText(msg) {
  const chatId = msg.chat.id;

  // From file path
  // const photo = 'PATH';
  const url = msg.text.split(" ")[1];

  bot.deleteMessage(chatId, msg.message_id);

  const photo = request(url);

  switch(url.substring(url.lastIndexOf('.') + 1)) {
    case 'png','webp':
      bot.sendSticker(chatId, photo, imageSignature(msg));
      break;
    case 'gif':
      bot.sendAnimation(chatId, photo, imageSignature(msg));
      break;
    default:
      bot.sendPhoto(chatId, photo, imageSignature(msg));
      // bot.sendMessage(chatId, "Que diabo de formato é esse?");
      break;
  }

});

// FEATURE AUDIO IMAGES
// bot.onText(/\/audio/, function onAudioText(msg) {
//   // From HTTP request
//   const url = 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Example.ogg';
//   const audio = request(url);
//   bot.sendAudio(msg.chat.id, audio);
// });


function removeBar(text) {
  return text.replace(PREFIX,'')
}

function formatDiceOutPut(rollingDices, result) {
  if(rollingDices.split(" ").length == 1) {
    return `${result}`;
  } else {
    return `${rollingDices} = ${result}`;
  }
}

function imageSignature(msg) {
  //TODO: REFACTOR TO USERNAME
  return { caption: `Requested by: @${msg.from.first_name}` };
}

module.exports = bot;