class BreedDbService {

    constructor(client) {
        this.client = client;
        this.col;
    }

    async createBreed(breed) {
        await this._getClient();
        await this.col.insertOne({ breed: breed });
    }

    async removeAllBreeds() {
        await this._getClient();
        await this.col.deleteMany({});
    }

    async getAllBreeds() {
        await this._getClient();
        return await this.col.find({});
    }

    async getRandomBreed() {
        await this._getClient();
        var query = {};
        var countDatabase = await this.col.count(query);
        var randomResult = Math.floor(Math.random() * countDatabase);
        var randomElementArray = await this.col.find(query).limit(1).skip(randomResult).toArray();
        return randomElementArray[0]['breed'];
    }

    // async teste() {
    //     await this._getClient();
    //     await this.col.createIndex(
    //         {breed: 1},
    //         { 
    //             name: "breed_idx",
    //             collation: {locale: "en", strength: 2},
    //             unique: true
    //         });
    // }

    async _getClient() {
        await this.client.connect();
        this.col = await this.client.db("gdp").collection("Breed");
    }


}

module.exports = BreedDbService;