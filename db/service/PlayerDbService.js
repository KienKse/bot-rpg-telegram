class PlayerDbService {

    constructor(client) {
        this.client = client;
        this.col;
    }

    async getUser(idUser) {
        await this._getClient();
        let player = await this.col.findOne({ _idUser: parseInt(idUser)});
        return player;
    }

    async validateAndCreateUser(receivedPlayer) {
        await this._getClient();
        let player = await this.col.findOne({ _idUser: receivedPlayer._idUser });
        if (!player) {
            this.createUser(receivedPlayer);
          return true;
        }
        return false;
    }

    async createUser(receivedPlayer) {
        await this.col.insertOne(receivedPlayer);
        console.log(
        `O Jogador de ID: ${receivedPlayer._idUser} com seu personagem: ${receivedPlayer._charName} foi salvo na base de dados.`
        );
    }

    async deleteUser(idUser) {
        await this._getClient();
        let player = await this.col.findOneAndDelete({ _idUser: parseInt(idUser)});
        return player.value;
    }

    async _getClient() {
        await this.client.connect();
        this.col = await this.client.db("gdp").collection("Player");
    }
}

module.exports = PlayerDbService;