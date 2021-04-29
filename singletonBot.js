const TelegramBot = require( `node-telegram-bot-api` );

const TOKEN = process.env.TOKEN;
const ENVIRONMENT = process.env.ENVIRONMENT;

var singletonBot = (() => {
  var instance;
  function createInstance() {
    let bot;
    if(ENVIRONMENT == 'PROD') {
      bot = new TelegramBot(TOKEN);
      bot.setWebHook(process.env.HEROKU_URL + bot.token);
    } else {
      bot = new TelegramBot( TOKEN, { polling: true});
    }
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