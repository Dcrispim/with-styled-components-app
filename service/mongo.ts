import {Db as DB,  MongoClient, Timestamp } from "mongodb";

interface DBType {
  connected: boolean;
  client?: MongoClient;
}

interface ConnectType {
  db: DB;
  client: MongoClient;
}


const Db: DBType = {
  connected: false,
};

Db.client = new MongoClient(
  process.env.DEV_DATABASE_URL || process.env.DATABASE_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

Db.client.on("open", () => {
  (Db.connected = true), console.log("DB connected.");
});
Db.client.on("topologyClosed", () => {
  (Db.connected = false), console.log("DB disconnected.");
});

export default async function connect(): Promise<ConnectType> {
  if (!Db.connected) await Db.client.connect();

  const db = Db.client.db("manga-livre-list");
  return { db, client:Db.client };
}
