import { getActoresCollection, getPeliculasCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import type { CastPatchT, CastT, FilmPatchT, FilmT } from "../models/types.js";

type PeliculaInputArgs = Omit<FilmT, "_id" | "cast"> & { cast: string[] };
type PeliculaPatchArgs = Omit<FilmPatchT, "cast"> & { cast?: string[] };

const checkActoresExisten = async (actores: ObjectId[]) => {
    const collection = getActoresCollection();
    const actoresQueExisten = await collection.find({ _id: { $in: actores } }).toArray();
    const idsUnicos = new Set(actores.map((actor) => actor.toHexString()));
    if (actoresQueExisten.length !== idsUnicos.size) {
        throw new Error("Algunos actores no existen")
    }
}

export const resolvers = {
    Query: {
        peliculas: async () => {
            const collection = getPeliculasCollection();

            return await collection.find().toArray();
        },
        pelicula: (_: unknown, args: { id: string }) => {
            const id = new ObjectId(args.id);
            const collection = getPeliculasCollection();
            return collection.findOne({ _id: id });
        },
        peliculasPorDirector: (_: unknown, args: { director: string }) => {
            const { director } = args;
            const collection = getPeliculasCollection();
            return collection.find({ director }).toArray();
        },
        actores: async () => {
            const collection = getActoresCollection();
            return await collection.find().toArray();
        },
        actor: async (_: unknown, args: { id: string }) => {
            const collection = getActoresCollection();
            return await collection.findOne({ _id: new ObjectId(args.id) })
        }
    },
    Mutation: {
        crearPelicula: async (_: unknown, args: { input: PeliculaInputArgs }) => {
            const collection = getPeliculasCollection();
            const cast = args.input.cast.map((idActor) => new ObjectId(idActor)); // Convertir los IDs de actores a ObjectId
            await checkActoresExisten(cast);

            const nuevaPeli: FilmT = {
                ...args.input,
                cast
            }

            const insertada = await collection.insertOne(nuevaPeli);

            return collection.findOne({
                _id: insertada.insertedId
            });
        },
        cambiarPelicula: async (_: unknown, args: { id: string, input: PeliculaPatchArgs }) => {
            const collection = getPeliculasCollection();
            const id = new ObjectId(args.id);
            const { cast, ...camposPelicula } = args.input;
            const cambios: FilmPatchT = { ...camposPelicula };

            if (cast !== undefined) {
                const idsActores = cast.map((idActor) => new ObjectId(idActor));
                await checkActoresExisten(idsActores);
                cambios.cast = idsActores;
            }

            return await collection.findOneAndUpdate(
                { _id: id },
                { $set: cambios },
                { returnDocument: "after" }
            );
        },
        eliminarPelicula: (_: unknown, args: { id: string }) => {
            const collection = getPeliculasCollection();
            const id = new ObjectId(args.id);
            return collection.findOneAndDelete({ _id: id });
        },
        crearActor: async (_: unknown, args: { input: CastT }) => {
            const collection = getActoresCollection();
            const insertado = await collection.insertOne(args.input);
            return await collection.findOne({ _id: insertado.insertedId });
        },
        cambiarActor: async (_: unknown, args: { id: string, input: CastPatchT }) => {
            const collection = getActoresCollection();

            return await collection.findOneAndUpdate(
                { _id: new ObjectId(args.id) },
                { $set: args.input },
                { returnDocument: "after" }
            )
        },
        eliminarActor: async (_: unknown, args: { id: string }) => {
            const collection = getActoresCollection();
            return await collection.findOneAndDelete({ _id: new ObjectId(args.id) })
        }
    },
    Pelicula: {
        cast: async (parent: FilmT) => {
            const collection = getActoresCollection();

            const actores = await collection.find({ _id: { $in: parent.cast as ObjectId[] } }).toArray();
            return actores;
        }
    }
};