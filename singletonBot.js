const TelegramBot = require( `node-telegram-bot-api` );
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 5000;

var singletonBot = (() => {
  var instance;
  function createInstance() {
    let bot = new TelegramBot( TOKEN, { webHook: { port: PORT }});
    console.log(`POLLING: ${bot.options.polling}`);
    console.log(`PORT: ${PORT}`);
    console.log(`HOST: ${HOST}`);
    return bot;
  }

  return {
      getInstance: () => {
          return !instance ? createInstance() : instance;
      }
  };
})();

module.exports = singletonBot.getInstance();