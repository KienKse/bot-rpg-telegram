const TelegramBot = require( `node-telegram-bot-api` );
// require("dotenv").config();

const TOKEN = process.env.TOKEN;
const PORT = process.env.PORT || 8432;
const HOST = process.env.HOST || '0.0.0.0';
const ENVIRONMENT = process.env.ENVIRONMENT;

var singletonBot = (() => {
  var instance;
  function createInstance() {
    let bot = new TelegramBot( TOKEN, ENVIRONMENT == 'PROD' ? { webHook: { port: PORT, host: HOST }} : { polling: true});
    console.log(`OPTIONS PORT: ${bot.options.webHook.port}`);
    console.log(`OPTIONS HOST: ${bot.options.webHook.host}`);
    console.log(`PORT: ${PORT}`);
    console.log(`HOST: ${HOST}`);
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