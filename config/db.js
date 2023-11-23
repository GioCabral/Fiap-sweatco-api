import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let client = null;
async function mongoConnect() {
  try {
    const uri = process.env.MONGODB_URI

    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();

    let db = client.db("mavenProd");

    return db;

  } catch (error) {
    console.log(error)
  }
}

export default mongoConnect;
