class Player {

  constructor(username, charName, _class, breed) {
    this._username = username;
    this._charName = charName;
    this._class = _class;
    this._breed = breed;
    this._created_at = new Date();
    this._updated_at = new Date();
  }

  updateData(data) {
    this._updated_at = data;
  }
}

module.exports = Player;