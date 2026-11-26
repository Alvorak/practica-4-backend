import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./schema/index.js";
import { resolvers } from "./resolvers/index.js";
import { connectDB } from "./config/db.js";

const server = new ApolloServer({
    typeDefs,
    resolvers
})

const startServer = async () => {

    await connectDB();
    const PORT = 3000;
    const { url } = await startStandaloneServer(server, {
        listen: { port: PORT }
    });
    console.log(url);
    console.log(`🌹 It's a strange world, isn't it?  Even my API is running on port ${PORT}.`);

};


startServer();