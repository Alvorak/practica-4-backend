import { getAlumnosCollection, getAsignaturasCollection } from "../config/db.js";
import { ObjectId } from "mongodb";
import type { AlumnoPatchT, AlumnoT, AsignaturaPatchT, AsignaturaT } from "../models/types.js";

const checkAsignaturasExisten = async (asignaturas: ObjectId[]) => {
    const collection = getAsignaturasCollection();
    const asignaturasQueExisten = await collection.find({ _id: { $in: asignaturas } }).toArray();
    if (asignaturasQueExisten.length !== asignaturas.length) {
        throw new Error("Algunas asignaturas no existen")
    }
}

const checkAlumnosExisten = async (alumnos: ObjectId[]) => {
    const collection = getAlumnosCollection();
    const alumnosQueExisten = await collection.find({ _id: { $in: alumnos } }).toArray();
    if (alumnosQueExisten.length !== alumnos.length) {
        throw new Error("Algunos alumnos no existen")
    }
}

export const resolvers = {
    Query: {
        alumnos: async () => {
            const collection = getAlumnosCollection();

            return await collection.find().toArray();
        },
        alumno: (_: unknown, args: { id: string }) => {
            const id = new ObjectId(args.id);
            const collection = getAlumnosCollection();
            return collection.findOne({ _id: id });
        },
        alumnosPorEdad: (_: unknown, args: { edad: number }) => {
            const { edad } = args;
            const collection = getAlumnosCollection();
            return collection.find({ edad }).toArray();
        },
        asignaturas: async () => {
            const collection = getAsignaturasCollection();
            return await collection.find().toArray();
        },
        asignatura: async (_: unknown, args: { id: string }) => {
            const id = new ObjectId(args.id);
            const collection = getAsignaturasCollection();
            return collection.findOne({ _id: id });
        },
        asignaturasPorCurso: async (_: unknown, args: { curso: number }) => {
            const { curso } = args;
            const collection = getAsignaturasCollection();
            return await collection.find({ curso }).toArray();
        }
    },
    Mutation: {
        crearAlumno: async (_: unknown, args: { input: AlumnoT }) => {
            const collection = getAlumnosCollection();
            const nuevoAlumno: AlumnoT = { ...args.input };
            if (args.input.asignaturas) {
                nuevoAlumno.asignaturas = args.input.asignaturas.map(
                    (idAsignatura) => new ObjectId(idAsignatura as string)
                );
                await checkAsignaturasExisten(nuevoAlumno.asignaturas as ObjectId[]);
            }
            const insertado = await collection.insertOne(nuevoAlumno);
            return await collection.findOne({ _id: insertado.insertedId });
        },
        actualizarAlumno: async (_: unknown, args: { id: string, input: AlumnoPatchT }) => {
            const collection = getAlumnosCollection();
            const id = new ObjectId(args.id);
            if (args.input.asignaturas) {
                await checkAsignaturasExisten(
                    args.input.asignaturas.map((idAsignatura) => new ObjectId(idAsignatura as string))
                );
            }
            return await collection.findOneAndUpdate(
                { _id: id },
                {
                    $set: args.input.asignaturas ? {
                        ...args.input,
                        asignaturas: args.input.asignaturas.map(
                            (idAsignatura) => new ObjectId(idAsignatura as string)
                        )
                    } : args.input
                },
                { returnDocument: "after" }
            );
        },
        eliminarAlumno: async (_: unknown, args: { id: string }) => {
            const collection = getAlumnosCollection();
            const id = new ObjectId(args.id);
            const alumno = await collection.findOneAndDelete({ _id: id });
            if (alumno) {
                const asignaturasCollection = getAsignaturasCollection();
                const asignaturas = await asignaturasCollection.find({ alumnos: id }).toArray();
                for (const asignatura of asignaturas) { // Buscamos todas las asignaturas y borramos al alumno de cada una de ellas
                    await asignaturasCollection.findOneAndUpdate(
                        { _id: asignatura._id },
                        { $pull: { alumnos: id } },
                        { returnDocument: "after" }
                    );
                }
            }
            return alumno;
        },
        crearAsignatura: async (_: unknown, args: { input: AsignaturaT }) => {
            const collection = getAsignaturasCollection();
            const nuevaAsignatura: AsignaturaT = { ...args.input };
            if (args.input.alumnos) {
                nuevaAsignatura.alumnos = args.input.alumnos.map(
                    (idAlumno) => new ObjectId(idAlumno as string)
                );
                await checkAlumnosExisten(nuevaAsignatura.alumnos as ObjectId[]);
            }
            const insertado = await collection.insertOne(nuevaAsignatura);
            return await collection.findOne({ _id: insertado.insertedId });
        },
        actualizarAsignatura: async (_: unknown, args: { id: string, input: AsignaturaPatchT }) => {
            const collection = getAsignaturasCollection();
            const id = new ObjectId(args.id);
            if (args.input.alumnos) {
                await checkAlumnosExisten(
                    args.input.alumnos.map((idAlumno) => new ObjectId(idAlumno as string))
                );
            }
            return await collection.findOneAndUpdate(
                { _id: id },
                {
                    $set: args.input.alumnos ? {
                        ...args.input,
                        alumnos: args.input.alumnos.map((idAlumno) => new ObjectId(idAlumno as string))
                    } : args.input
                },
                { returnDocument: "after" }
            );
        },
        eliminarAsignatura: async (_: unknown, args: { id: string }) => {
            const collection = getAsignaturasCollection();
            const id = new ObjectId(args.id);
            const asignatura = await collection.findOneAndDelete({ _id: id });
            if (asignatura) {
                const alumnosCollection = getAlumnosCollection();
                const alumnos = await alumnosCollection.find({ asignaturas: id }).toArray();
                for (const alumno of alumnos) {
                    await alumnosCollection.findOneAndUpdate(
                        { _id: alumno._id },
                        { $pull: { asignaturas: id } },
                        { returnDocument: "after" }
                    );
                }
            }
            return asignatura;
        },
        matricularAlumno: async (_: unknown, args: { alumnoId: string, asignaturaId: string }) => {
            const alumnoId = new ObjectId(args.alumnoId);
            const asignaturaId = new ObjectId(args.asignaturaId);

            const alumnosCollection = getAlumnosCollection();
            const asignaturasCollection = getAsignaturasCollection();

            // Verificar si el alumno y la asignatura existen
            const alumno = await alumnosCollection.findOne({ _id: alumnoId });
            if (!alumno) {
                throw new Error("El alumno no existe");
            }

            const asignatura = await asignaturasCollection.findOne({ _id: asignaturaId });
            if (!asignatura) {
                throw new Error("La asignatura no existe");
            }

            // Actualizar el alumno para agregar la asignatura
            await alumnosCollection.findOneAndUpdate(
                { _id: alumnoId },
                { $addToSet: { asignaturas: asignaturaId } },
                { returnDocument: "after" }
            );

            // Actualizar la asignatura para agregar el alumno
            await asignaturasCollection.findOneAndUpdate(
                { _id: asignaturaId },
                { $addToSet: { alumnos: alumnoId } },
                { returnDocument: "after" }
            );

            // Devolver el alumno actualizado
            return await alumnosCollection.findOne({ _id: alumnoId });
        },
        desmatricularAlumno: async (_: unknown, args: { alumnoId: string, asignaturaId: string }) => {
            const alumnoId = new ObjectId(args.alumnoId);
            const asignaturaId = new ObjectId(args.asignaturaId);

            const alumnosCollection = getAlumnosCollection();
            const asignaturasCollection = getAsignaturasCollection();

            // Verificar si el alumno y la asignatura existen
            const alumno = await alumnosCollection.findOne({ _id: alumnoId });
            if (!alumno) {
                throw new Error("El alumno no existe");
            }

            const asignatura = await asignaturasCollection.findOne({ _id: asignaturaId });
            if (!asignatura) {
                throw new Error("La asignatura no existe");
            }

            // Actualizar el alumno para eliminar la asignatura
            await alumnosCollection.findOneAndUpdate(
                { _id: alumnoId },
                { $pull: { asignaturas: asignaturaId } },
                { returnDocument: "after" }
            );

            // Actualizar la asignatura para eliminar el alumno
            await asignaturasCollection.findOneAndUpdate(
                { _id: asignaturaId },
                { $pull: { alumnos: alumnoId } },
                { returnDocument: "after" }
            );

            // Devolver el alumno actualizado
            return await alumnosCollection.findOne({ _id: alumnoId });
        }
    },
    AlumnoT: {
        asignaturas: async (parent: AlumnoT) => {
            if (!parent.asignaturas) {
                return [];
            }
            const collection = getAsignaturasCollection();
            const asignaturas = await collection.find({ _id: { $in: parent.asignaturas as ObjectId[] } }).toArray();
            return asignaturas;
        }
    },
    AsignaturaT: {
        alumnos: async (parent: AsignaturaT) => {
            if (!parent.alumnos) {
                return [];
            }
            const collection = getAlumnosCollection();
            const alumnos = await collection.find({ _id: { $in: parent.alumnos as ObjectId[] } }).toArray();
            return alumnos;
        }
    }
};