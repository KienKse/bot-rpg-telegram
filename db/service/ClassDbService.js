class ClassDbService {

    constructor(client) {
        this.client = client;
        this.col;
    }

    async createClass(_class) {
        await this._getClient();
        await this.col.insertOne({ _class: _class });
        // await this.col.insertOne({ _class: _class });
    }

    async removeAllClasses() {
        await this._getClient();
        await this.col.deleteMany({});
    }

    async getRandomClass() {
        await this._getClient();
        var query = {};
        var countDatabase = await this.col.count(query);
        var randomResult = Math.floor(Math.random() * countDatabase);
        var randomElementArray = await this.col.find(query).limit(1).skip(randomResult).toArray();
        return randomElementArray[0]['_class'];
    }

    async getAllClasses() {
        await this._getClient();
        return await this.col.find({});
    }

    // async teste() {
    //     await this._getClient();
    //     await this.col.createIndex(
    //         {_class: 1},
    //         { 
    //             name: "_class_idx",
    //             collation: {locale: "en", strength: 2},
    //             unique: true
    //         });
    // }
   
    async _getClient() {
        await this.client.connect();
        this.col = await this.client.db("gdp").collection("_Class");
    }


}

module.exports = ClassDbService;