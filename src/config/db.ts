import { Collection, MongoClient } from "mongodb";
import type { AlumnoT, AsignaturaT } from "../models/types.js";


const client = new MongoClient("mongodb+srv://FrankNFurter:4002@cluster0.2yp6ln1.mongodb.net/");


let alumnosCollection: Collection<AlumnoT>;
let asignaturasCollection: Collection<AsignaturaT>;

export const connectDB = async () => {
    await client.connect();

    const db = client.db("Vicio");

    alumnosCollection = db.collection<AlumnoT>("alumnos");
    asignaturasCollection = db.collection<AsignaturaT>("asignaturas");


    console.log("Conectado al Mondongo")
};

export const getAlumnosCollection = () => {
    return alumnosCollection
}
export const getAsignaturasCollection = () => {
    return asignaturasCollection
}