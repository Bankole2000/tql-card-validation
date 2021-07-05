const http = require("http");
const fs = require("fs");
const path = require("path");

const ServerInit = require("./ServerInit.js");

const newServer = new ServerInit();

const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

const addEnvironmentVariables = async (file) => {
    try {
        const data = fs.readFileSync(file, { encoding: "utf-8" });
        const keyValueArray = data.split("\n");
    
        for(let index in keyValueArray) {
            const [key, ...rest] = keyValueArray[index].split('=');
            const value = rest.join('=');
    
            process.env[key.trim()] = value.trim();
        }
    } catch(e) {
        console.log(e.message);
    }
}

module.exports = () => {

    const app = {
        get: null,
        post: null,
        put: null,
        delete: null,
        listen: null,
    };

    const routes = {
        GET: {},
        POST: {},
        PUT: {},
        PATCH:{},
        DELETE: {},
    };

    addEnvironmentVariables(path.resolve(__dirname, '../.env'));

    methods.forEach(method => 
        app[method.toLowerCase()] = (url, ...handlers) =>
            routes[method][url.replace(/^\/+|\/+$/g, "")] = handlers
    );

    const server = http.createServer(newServer.handleRequests(routes));

    app.listen = newServer.listen(server);

    return app;
}
