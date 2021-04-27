const { MongoClient } = require('mongodb');
// require("dotenv").config();

const URI = process.env.URI;

const client = new MongoClient(URI);

async function main() {
  try {
    await client.connect();
  } catch (e) {
      console.error(e);
  } finally {
    await client.close();
  }
}

async function createUser(receivedPlayer) {
  await getClient();
  const col = await client.db('gdp').collection('Player');
  let player = await col.findOne({ username: receivedPlayer._username });
  if (!player) {
    player = await col.insertOne(receivedPlayer);
    console.log(
      `O Jogador: ${receivedPlayer._username} com seu personagem: ${receivedPlayer._charName} foi salvo na base de dados.`
    );
    return true;
  }
  return false;
}

async function getUser(username) {
  await getClient();
  console.log(username);
  const col = await client.db('gdp').collection('Player');
  let player = await col.findOne({ _username: username });
  console.log(player);
  return player;
}

async function deleteUser(username) {
  await getClient();
  const col = await client.db('gdp').collection('Player');
  let player = await col.findOneAndDelete({ _username: username });
  return player.value;
}

async function getClient() {
  try {
    await client.connect();
  } catch (e) {
      console.error(e);
  } 
  // finally {
  //   await client.close();
  // }
}

  // col.insertOne({
  //   username: "localTest",
  //   charName: "localTestChar",
  //   class:  "localTestClass",
  //   breed:  "localTestBreed",
  //   created_at: new Date(),
  //   updated_at: new Date()
  // });

  // col.find({}).toArray(function(err, items) {
  //   console.log(items.length);
  // });

module.exports = { getUser, createUser, deleteUser };