class Player {

  constructor(idUser, charName, _class, breed, items) {
    this._idUser = idUser;
    this._charName = charName;
    this._class = _class;
    this._breed = breed;
    this._created_at = new Date();
    this._updated_at = new Date();
    this._items = items;
  }

  updateData(data) {
    this._updated_at = data;
  }
}

module.exports = Player;