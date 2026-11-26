export const typeDefs = `#graphql

    type Cast {
        _id: ID!
        name: String!,
        sex: String!,
        roles: [String!]!
    }

    type Pelicula {
        _id: ID!,
        name: String!,
        director: String!,
        runtime: Int!,
        year: Int!,
        recordingFormat: [String!]!,
        cast: [Cast!]!
    }

    input CastInput {
        name: String!,
        sex: String!,
        roles: [String!]!
    }

    input CastPatchInput {
        name: String,
        sex: String,
        roles: [String!]
    }

    input PeliculaInput {
        name: String!,
        director: String!,
        runtime: Int!,
        year: Int!,
        recordingFormat: [String!]!,
        cast: [ID!]!
    }

    input PeliculaChangeInput {
        name: String,
        director: String,
        runtime: Int,
        year: Int,
        recordingFormat: [String!],
        cast: [ID!]
    }

    type Query {
        peliculas: [Pelicula!]!
        pelicula(id: ID!): Pelicula
        peliculasPorDirector(director: String!): [Pelicula!]!
        actores: [Cast!]!
        actor(id: ID!): Cast
    }

    type Mutation {
        crearPelicula(input: PeliculaInput!): Pelicula!
        cambiarPelicula(id: ID!, input: PeliculaChangeInput!): Pelicula
        eliminarPelicula(id: ID!): Pelicula
        crearActor(input: CastInput!): Cast!
        cambiarActor(id: ID!, input: CastPatchInput!): Cast
        eliminarActor(id: ID!): Cast
    }
`