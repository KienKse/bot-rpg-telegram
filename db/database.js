const { MongoClient } = require("mongodb");
const PlayerDbService = require("./service/PlayerDbService");
const ClassDbService = require("./service/ClassDbService");
const BreedDbService = require("./service/BreedDbService");

const URI = process.env.URI;
class MongoDb {
  
  constructor() {
    this.client = new MongoClient(URI);
    this.playerDb = new PlayerDbService(this.client);
    this.classDb = new ClassDbService(this.client);
    this.breedDb = new BreedDbService(this.client);
  }
}

module.exports = MongoDb;