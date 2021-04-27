const TelegramBot = require( `node-telegram-bot-api` );
// require("dotenv").config();

const TOKEN = process.env.TOKEN;

var singletonBot = (() => {
  var instance;

  function createInstance() {
    let bot = new TelegramBot( TOKEN, { polling: true } );
      return bot;
  }

  return {
      getInstance: () => {
          return !instance ? createInstance() : instance;
      }
  };
})();

module.exports = singletonBot.getInstance();