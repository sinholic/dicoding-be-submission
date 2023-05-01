'use strict';

const Hapi = require('@hapi/hapi');
const routes = require('../routes')

const server = Hapi.server({
    port: 9000,
    host: 'localhost'
});

server.route(routes);

exports.init = async () => {

    await server.initialize();
    return server;
};

exports.start = async () => {

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
    return server;
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});
