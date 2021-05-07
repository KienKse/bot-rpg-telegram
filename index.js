require("dotenv").config();
const { performance } = require('perf_hooks');
const request = require('request');
const bot = require('./singletonBot');
const staticInfo = require('./db/staticInfo.json');

const helperService = require('./service/helperService');

const MongoDb = require('./db/database');
const database = new MongoDb();

const Player = require('./src/model/player');
const signature = 'Requested by user id:';


bot.onText(/\/id/, async (message) => {
  await bot.sendMessage(helperService.chatId(message), `Seu id é: ${message.from.id}`, helperService.replyToSender(message));
  bot.deleteMessage(helperService.chatId(message), message.message_id);
});

bot.onText(/\/(personagem|generate) \w+/, async (message) => {
  let nomeChar = message.text.replace(/\/(personagem|generate) /,"");
  let idUser = message.from.id;

  let player = await database.playerDb.getUser(idUser);
  if(player) {
    bot.sendMessage(helperService.chatId(message), "Personagem encontrado!");
  } else {
    player = new Player(
      idUser,
      nomeChar,
      await database.classDb.getRandomClass(),
      await database.breedDb.getRandomBreed(),
      null
    );

    await database.playerDb.createUser(player);

    await bot.sendMessage(helperService.chatId(message), helperService.pickARandomStringFromList(staticInfo.NewMessagesAdventures));
  }

  bot.sendMessage(helperService.chatId(message), helperService.formatCharacterOutPut(player), helperService.replyToSender(message));
});

bot.onText(/\/info personagem/, async (message) => {
  let player = await database.playerDb.getUser(message.from.id);
  if(player) {
    bot.sendMessage(helperService.chatId(message), helperService.formatCharacterOutPut(player));
  } else {
    bot.sendMessage(helperService.chatId(message), "Desculpe... não encontrei nenhum personagem com seus dados por aqui.");
  }
});

bot.onText(/\/deletePersonagem \d+/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let idUser = message.text.replace(/\/deletePersonagem /,"");
    let player = await database.playerDb.deleteUser(idUser);
    if(player) {
      bot.sendMessage(helperService.chatId(message), "Personagem deletado com sucesso!");
    } else {
      bot.sendMessage(helperService.chatId(message), "Não encontrei o usuário!");
    }
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

/* CLASSES */

bot.onText(/\/add classe \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let _class = message.text.replace(/\/add classe /,"");
    await helperService.verifyAndAddClass(message, _class);
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
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
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/delete classes/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    database.classDb.removeAllClasses();
    bot.sendMessage(helperService.chatId(message), "Classes removidas com sucesso!");
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/allClasses/, async (message) => {
    let teste = await database.classDb.getAllClasses();
    await helperService.printListByElementObject(message, teste, '_class');
});


bot.onText(/\/classe aleatoria/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let randomClass = await database.classDb.getRandomClass();
    bot.sendMessage(helperService.chatId(message), randomClass);
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

/* BREED */

bot.onText(/\/add ra(c|ç)a \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let breed = message.text.replace(/\/add ra(c|ç)a /,"");
    await helperService.verifyAndAddBreed(message, breed);
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/add ra(c|ç)as \w+.*/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let breeds = message.text.replace(/\/add ra(c|ç)as /,"");
    breeds = breeds.split(" ");
    breeds.forEach(breed => {
      console.log(breed);
      // helperService.verifyAndAddBreed(message, breed);
    });
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/delete ra(c|ç)as/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    database.breedDb.removeAllBreeds();
    bot.sendMessage(helperService.chatId(message), "Raças removidas com sucesso!");
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

bot.onText(/\/allRa(c|ç)as/, async (message) => {
  let teste = await database.breedDb.getAllBreeds();
  await helperService.printListByElementObject(message, teste, 'breed');
});

bot.onText(/\/ra(c|ç)a aleatoria/, async (message) => {
  if(helperService.verifyAdminAcess(message.from)) {
    let randomBreed = await database.breedDb.getRandomBreed();
    bot.sendMessage(helperService.chatId(message), randomBreed);
  } else {
    bot.sendMessage(helperService.chatId(message), "Você não tem permissão!");
  }
});

/* OTHERS */

bot.onText(/\/ping/, (message) => {
  var start = performance.now()
  var end = performance.now();
  const resp = `Poong!\nIsso levou: ${(end - start).toFixed(4)} milissegundos`;
  bot.sendMessage(helperService.chatId(message), resp);
});

bot.onText(/\/caracoroa/, function (message) {
  const resp = (Math.floor(Math.random() * 2) == 0) ? 'Cara' : 'Coroa';
  bot.sendMessage(helperService.chatId(message), `Seu resultado é: ${resp}`);
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

  bot.sendMessage(helperService.chatId(message), helperService.formatDiceOutPut(writedOutPut, result), helperService.replyToSender(message));
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
  bot.deleteMessage(helperService.chatId(message), message.message_id);
});

bot.onText(/\/start/, function onPhotoText(message) {
  // From file path
  const photo = './assets/sticker/greetings.gif';
  bot.sendAnimation(helperService.chatId(message), photo, {
    caption: "Saudações!"
  });
});

bot.onText(/\/sticker/, function onPhotoText(message) {
  const url = message.text.split(" ")[1];

  bot.deleteMessage(helperService.chatId(message), message.message_id);

  const photo = request(url);

  switch(url.substring(url.lastIndexOf('.') + 1)) {
    case 'png','webp':
      bot.sendSticker(helperService.chatId(message), photo, helperService.imageSignature(signature, message));
      break;
    case 'gif':
      bot.sendAnimation(helperService.chatId(message), photo, helperService.imageSignature(signature, message));
      break;
    default:
      bot.sendPhoto(helperService.chatId(message), photo, helperService.imageSignature(signature, message));
      // bot.sendMessage(helperService.chatId(message), "Que diabo de formato é esse?");
      break;
  }
});

require('./web')(bot);
