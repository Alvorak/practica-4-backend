import { Collection, MongoClient } from "mongodb";
import type { CastT, FilmT } from "../models/types.js";


const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    throw new Error("Falta configurar MONGODB_URI en el archivo .env");
}

const client = new MongoClient(mongoUri);


let peliculasCollection: Collection<FilmT>;
let actoresCollection: Collection<CastT>;

export const connectDB = async () => {
    await client.connect();

    const db = client.db(process.env.MONGODB_DB || "Vicio");

    peliculasCollection = db.collection<FilmT>("cine2");
    actoresCollection = db.collection<CastT>("actores2");

    console.log("Conectado al Mondongo")
};

export const getPeliculasCollection = () => {
    return peliculasCollection
}
export const getActoresCollection = () => {
    return actoresCollection
}