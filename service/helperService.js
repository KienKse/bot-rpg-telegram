/* HELPER */

const helperService = {
  async printListByElementObject(message, list, element) {
    let formatedList = [];
    list.toArray((err, items) => {
      items.forEach((item) => {
        formatedList.push(item[element]);
      });
      let result = formatedList.join([(separador = ", ")]);
      if (result) {
        bot.sendMessage(chatId(message), result);
      } else {
        bot.sendMessage(
          chatId(message),
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
          chatId(message),
          `Classe ${_class} inserida com sucesso com sucesso!`
        );
      })
      .catch(() => {
        bot.sendMessage(
          chatId(message),
          `Eu acho que já tenho noção sobre a classe ${_class}!`
        );
      });
  },
  async verifyAndAddBreed(message, breed) {
    await database.breedDb
      .createBreed(breed)
      .then(() => {
        bot.sendMessage(
          chatId(message),
          `Raça ${breed} inserida com sucesso com sucesso!`
        );
      })
      .catch(() => {
        bot.sendMessage(
          chatId(message),
          `Eu acho que já tenho noção sobre a raça ${breed}!`
        );
      });
  },
  validIndexCritic(index, message) {
    let photo = "";
    if (index >= 1) {
      photo = pickARandomImageFromFolder(criticalFiles);
      bot.sendPhoto(
        chatId(message),
        `../assets/sticker/critical/${photo}`,
        imageSignature(criticResult, message)
      );
    } else if (index < 0) {
      photo = pickARandomImageFromFolder(criticalFailFiles);
      bot.sendPhoto(
        chatId(message),
        `../assets/sticker/criticalFail/${photo}`,
        imageSignature(faliureCriticResult, message)
      );
    }
  },
  pickARandomImageFromFolder(folder) {
    return folder[randomIntFromInterval(0, folder.length - 1)];
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
  verifyCritic(sideNumber, result) {
    if (sideNumber == criticDice) {
      if (result == criticDice) {
        return 1;
      } else if (result == missDice) {
        return -1;
      }
      return 0;
    }
  },
  replyToSender(message) {
    return { reply_to_message_id: message.message_id };
  },
  pickARandomStringFromList(list) {
    return list[randomIntFromInterval(0, list.length)];
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
};

module.exports = helperService;