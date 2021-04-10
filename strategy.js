class StrategyManager {
  constructor() {
    this._strategies = [];
  }
  addStrategy(strategy) {
    this._strategies.push(strategy);
  }
  getStrategy(command) {
    return this._strategies.find(strategy => strategy._command === command);
  }
}

class Strategy {
  constructor(command, handler) {
    this._command = command;
    this._handler = handler;
  }
  runCommand() {
    this._handler();
  }
}

module.exports = StrategyManager;
module.exports.Strategy = Strategy;