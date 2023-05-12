import { MongoClient } from "mongodb";

export class Database {
  constructor() {
    if (!Database.instance) {
      const uri = "mongodb+srv://suren:uAh4opT0Y2kKGTS9@cluster0.ca50z3z.mongodb.net/vehicles?retryWrites=true&w=majority";
      this.client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      Database.instance = this;
    }

    return Database.instance;
  }

  async getDocuments() {
    try {
      await this.client.connect();
      const database = this.client.db("vehicles");
      const collection = database.collection("two_wheeler");
      const documents = await collection.find().toArray();
      return documents;
    } catch (err) {
      console.error(`Exception (not connected): ${err}`);
    } finally {
      await this.client.close();
      console.log("MongoDB connection closed");
    }
  }
}
