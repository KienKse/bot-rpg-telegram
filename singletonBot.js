const TelegramBot = require( `node-telegram-bot-api` );
require("dotenv").config();

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 5000;
const ENVIRONMENT = process.env.ENVIRONMENT;

var singletonBot = (() => {
  var instance;
  function createInstance() {
    let bot = new TelegramBot( TOKEN, ENVIRONMENT == 'PROD' ? { webHook: { port: PORT }} : { polling: true});
    console.log(`PORT: ${PORT}`);
    console.log(`ENVIRONMENT: ${ENVIRONMENT}`);
    console.log(`POLLING: ${bot.options.polling}`);
    return bot;
  }

  return {
      getInstance: () => {
          return !instance ? createInstance() : instance;
      }
  };
})();

module.exports = singletonBot.getInstance();