require("dotenv").config();
const { performance } = require('perf_hooks');
const request = require('request');
const bot = require('./singletonBot');
const staticInfo = require('./db/staticInfo.json');

const helperService = require('./service/helperService');

const MongoDb = require('./db/database');
const database = new MongoDb();

var fs = require('fs');
const Player = require('./src/model/player');
const criticalFiles = fs.readdirSync('./assets/sticker/critical');
const criticalFailFiles = fs.readdirSync('./assets/sticker/criticalFail');

const PREFIX = '/';
const criticDice = 20;
const missDice = 1;
const signature = 'Requested by user id:';
const criticResult = '!!Acerto Crítico!!\nUser id: ';
const faliureCriticResult = '!!!Falha Crítica!!!\nUser id: ';

const ADMIN = {
  id: process.env.ID_ADMIN,
  username: process.env.USERNAME_ADMIN
}

bot.onText(/\/id/, async (message) => {
  await bot.sendMessage(chatId(message), `Seu id é: ${message.from.id}`, helperService.replyToSender(message));
  bot.deleteMessage(chatId(message), message.message_id);
});

bot.onText(/\/(personagem|generate) \w+/, async (message) => {
  let nomeChar = message.text.replace(/\/(personagem|generate) /,"");
  let idUser = message.from.id;

  let player = await database.playerDb.getUser(idUser);
  if(player) {
    bot.sendMessage(chatId(message), "Personagem encontrado!");
  } else {
    player = new Player(
      idUser,
      nomeChar,
      await database.classDb.getRandomClass(),
      await database.breedDb.getRandomBreed(),
      null
    );

    await database.playerDb.createUser(player);

    await bot.sendMessage(chatId(message), helperService.pickARandomStringFromList(staticInfo.NewMessagesAdventures));
  }

  bot.sendMessage(chatId(message), helperService.formatCharacterOutPut(player), helperService.replyToSender(message));
});

bot.onText(/\/info personagem/, async (message) => {
  let player = await database.playerDb.getUser(message.from.id);
  if(player) {
    bot.sendMessage(chatId(message), helperService.formatCharacterOutPut(player));
  } else {
    bot.sendMessage(chatId(message), "Desculpe... não encontrei nenhum personagem com seus dados por aqui.");
  }
});

bot.onText(/\/deletePersonagem \d+/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let idUser = message.text.replace(/\/deletePersonagem /,"");
    let player = await database.playerDb.deleteUser(idUser);
    if(player) {
      bot.sendMessage(chatId(message), "Personagem deletado com sucesso!");
    } else {
      bot.sendMessage(chatId(message), "Não encontrei o usuário!");
    }
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

/* CLASSES */

bot.onText(/\/add classe \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let _class = message.text.replace(/\/add classe /,"");
    await helperService.verifyAndAddClass(message, _class);
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/add classes \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let classes = message.text.replace(/\/add classes /,"");
    classes = classes.split(" ");
    classes.forEach(_class => {
      helperService.verifyAndAddClass(message, _class);
    });
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/delete classes/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    database.classDb.removeAllClasses();
    bot.sendMessage(chatId(message), "Classes removidas com sucesso!");
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/allClasses/, async (message) => {
    let teste = await database.classDb.getAllClasses();
    await printListByElementObject(message, teste, '_class');
});


bot.onText(/\/classe aleatoria/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let randomClass = await database.classDb.getRandomClass();
    bot.sendMessage(chatId(message), randomClass);
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

/* BREED */

bot.onText(/\/add ra(c|ç)a \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let breed = message.text.replace(/\/add ra(c|ç)a /,"");
    await helperService.verifyAndAddBreed(message, breed);
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/add ra(c|ç)as/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let breeds = message.text.replace(/\/add ra(c|ç)as /,"");
    breeds = breeds.split(" ");
    breeds.forEach(breed => {
      helperService.verifyAndAddBreed(message, breed);
    });
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/delete ra(c|ç)as/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    database.breedDb.removeAllBreeds();
    bot.sendMessage(chatId(message), "Raças removidas com sucesso!");
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/allRa(c|ç)as/, async (message) => {
  let teste = await database.breedDb.getAllBreeds();
  await printListByElementObject(message, teste, 'breed');
});

bot.onText(/\/ra(c|ç)a aleatoria/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let randomBreed = await database.breedDb.getRandomBreed();
    bot.sendMessage(chatId(message), randomBreed);
  } else {
    bot.sendMessage(chatId(message), "Você não tem permissão!");
  }
});

/* OTHERS */

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

  let rollInfo = helperService.removeBar(message.text).split('d');
  let sortedDices = [];
  const sideNumber = rollInfo[1];
  let criticIndexs = 0;

  while(rollInfo[0] != 0) {
    let result = helperService.randomIntFromInterval(1, sideNumber);
    criticIndexs += helperService.verifyCritic(sideNumber, result);
    sortedDices.push(result);
    rollInfo[0]--;
  }

  const writedOutPut = `${sortedDices.join(' + ')}`;
  const result = `${eval(sortedDices.join('+'))}`;

  helperService.validIndexCritic(criticIndexs, message);

  bot.sendMessage(chatId(message), helperService.formatDiceOutPut(writedOutPut, result), replyToSender(message));
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
      bot.sendSticker(chatId(message), photo, helperService.imageSignature(signature, message));
      break;
    case 'gif':
      bot.sendAnimation(chatId(message), photo, helperService.imageSignature(signature, message));
      break;
    default:
      bot.sendPhoto(chatId(message), photo, helperService.imageSignature(signature, message));
      // bot.sendMessage(chatId(message), "Que diabo de formato é esse?");
      break;
  }
});

const chatId = (message) => {
  return message.chat.id;
}

require('./web')(bot);