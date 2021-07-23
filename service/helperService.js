const bot = require('../singletonBot');

const PREFIX = '/';
const ADMIN = {
  id: process.env.ID_ADMIN,
  username: process.env.USERNAME_ADMIN
}

const helperService = {
  async printListByElementObject(message, list, element) {
    let formatedList = [];
    list.toArray((err, items) => {
      items.forEach((item) => {
        formatedList.push(item[element]);
      });
      let result = formatedList.join([(separator = ", ")]);
      if (result) {
        bot.sendMessage(this.chatId(message), result);
      } else {
        bot.sendMessage(
          this.chatId(message),
          "Ué... não encontrei nenhum resultado por aqui!"
        );
      }
    });
  },
  async verifyAndAddClass(message, _class) {
    await database.classDb
      .createClass(_class)
      .then(() => {
        bot.sendMessage(
          this.chatId(message),
          `Classe ${_class} inserida com sucesso com sucesso!`
        );
      })
      .catch(() => {
        bot.sendMessage(
          this.chatId(message),
          `Eu acho que já tenho noção sobre a classe ${_class}!`
        );
      });
  },
  async verifyAndAddBreed(message, breed) {
    await database.breedDb
      .createBreed(breed)
      .then(() => {
        bot.sendMessage(
          this.chatId(message),
          `Raça ${breed} inserida com sucesso com sucesso!`
        );
      })
      .catch(() => {
        bot.sendMessage(
          this.chatId(message),
          `Eu acho que já tenho noção sobre a raça ${breed}!`
        );
      });
  },
  pickARandomImageFromFolder(folder) {
    return folder[this.randomIntFromInterval(0, folder.length - 1)];
  },
  removeBar(text) {
    return text.replace(PREFIX, "");
  },
  formatDiceOutPut(rollingDices, result) {
    if (rollingDices.split(" ").length == 1) {
      return `${result}`;
    } else {
      return `${rollingDices} = ${result}`;
    }
  },
  randomIntFromInterval(min, max) {
    return Math.floor(Math.random() * max) + min;
  },
  imageSignature(signature, message) {
    return {
      caption: `${signature}${message.from.id} -> ${message.from.first_name}`,
    };
  },
  replyToSender(message) {
    return { reply_to_message_id: message.message_id };
  },
  pickARandomStringFromList(list) {
    return list[this.randomIntFromInterval(0, list.length)];
  },
  formatCharacterOutPut(character) {
    return `Nome: ${character._charName} | Raça: ${character._breed} | Classe: ${character._class}`;
  },
  verifyAdminAcess(user) {
    if (user.id == ADMIN.id && user.username == ADMIN.username) {
      return true;
    }
    return false;
  },
  chatId(message) {
    return message.chat.id;
  }
};

module.exports = helperService;