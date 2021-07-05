const https = require("https");
const ResponseObject = require('./ResponseObject')
const { parse } = require('querystring')
const dataMethods = ["POST", "PUT", "PATCH"];

class ServerInit {
  listen = (server) => {
    return ((port, callback) => {

      return server.listen(port, callback)
    })
  }

  handleResponse = (res, statusCode, message) => {
    res.writeHead(statusCode, { "Content-Type": "application/json" });

    res.end(JSON.stringify(message));
  }

  processRequest = async (req, responseObject, res, routes) => {
    let status;
    try {
      const urlPath = req.url.replace(/^\/+|\/+$/g, "");

      const method = req.method;
      const handlerFunctions = routes[method][urlPath];

      if (!handlerFunctions) {
        status = 404;
        return this.handleResponse(res, status, { status: 404, message: `Cannot ${method} to this route` })
      }
      if (handlerFunctions.length === 1) {

        await handlerFunctions[0](req, responseObject);
        return responseObject.res.end(responseObject.resData);
      }
      if (handlerFunctions.length > 1) {

        for (let counter = 0; counter < handlerFunctions.length; counter++) {
          await handlerFunctions[counter](req, responseObject, "NEXT_FUNCTION_RETURN_VALUE");

          if (responseObject.resData) {
            return responseObject.res.end(responseObject.resData);
          }
        }
      }

    } catch (e) {

      this.handleResponse(res, 500, {
        status: "Server Error",
        error: e.message
      })
    }
  }

  handleRequests = (routes) => async (req, res) => {
    const responseObject = new ResponseObject(req, res);

    if (dataMethods.includes(req.method)) {

      if (req.headers['content-type'] == 'application/xml') {
        await this.parseXMLBody(req).then(() => {

          this.processRequest(req, responseObject, res, routes)
        }).catch(err => {
          this.handleResponse(res, 500, {
            status: "Server Error",
            error: err.message
          })
        })
      } else if (req.headers['content-type'] == 'application/json') {
        await this.parseJSONBody(req).then(() => {

          this.processRequest(req, responseObject, res, routes)

        }).catch(err => {
          this.handleResponse(res, 500, {
            status: "Server Error",
            error: err.message
          })
        })
      } else if (req.headers['content-type'].includes('multipart/form-data')) {
        // Use latin1 encoding to parse binary files correctly
        req.setEncoding('latin1')
        await this.parseFormBodyData(req).then(() => {
          this.processRequest(req, responseObject, res, routes)
        })
      }
      else if (req.headers['content-type'] == "application/x-www-form-urlencoded") {
        await this.parseFormBody(req).then(() => {

          this.processRequest(req, responseObject, res, routes)

        })
      }
      else {
        this.handleResponse(res, 403, {
          status: "Forbidden",
          message: "Unsupported content type"
        });
        return;
      }
    } else {
      this.processRequest(req, responseObject, res, routes)
    }
  }

  getBoundary = async (request) => {
    let contentType = request.headers['content-type']
    const contentTypeArray = contentType.split(';').map(item => item.trim())
    const boundaryPrefix = 'boundary='
    let boundary = contentTypeArray.find(item => item.startsWith(boundaryPrefix))
    if (!boundary) return null
    boundary = boundary.slice(boundaryPrefix.length)
    if (boundary) boundary = boundary.trim()
    return boundary
  }

  getMatching = (string, regex) => {
    // Helper function when using non-matching groups
    const matches = string.match(regex)
    if (!matches || matches.length < 2) {
      return null
    }
    return matches[1]
  }

  parseFormBodyData = async (req) => {
    return new Promise((resolve, reject) => {
      let chunked = "";
      req
        .on("error", err => {
          console.error(err);
          reject();
        })
        .on("data", chunk => {
          chunked += chunk.toString();
        })
        .on("end", async () => {

          const boundary = await this.getBoundary(req)

          const formEntries = chunked.split(boundary)

          const data = {};
          for (let item of formEntries) {

            let name = this.getMatching(item, /(?:name=")(.+?)(?:")/)

            if (!name || !(name = name.trim())) continue
            let value = this.getMatching(item, /(?:\r\n\r\n)([\S\s]*)(?:\r\n--$)/)

            if (!value) continue
            data[name] = value;
          }
          req.body = data;

          resolve();
        });
    })

  }

  parseFormBody = async (req) => {
    return new Promise((resolve, reject) => {
      let chunked = "";
      req
        .on("error", err => {
          console.error(err);
          reject();
        })
        .on("data", chunk => {
          chunked += chunk.toString();
        })
        .on("end", async () => {
          let parsedData = parse(chunked)
          const formEntries = chunked.split('&');
          const data = {};
          for (let pair of formEntries) {
            const [key, value] = pair.split('=');
            data[key] = decodeURIComponent(value);
          }
          req.body = parsedData;

          resolve();
        });
    })

  }

  parseXMLBody = async (req) => {
    return new Promise((resolve, reject) => {
      let chunked = "";
      req
        .on("error", err => {
          console.error(err);
          reject();
        })
        .on("data", chunk => {
          chunked += chunk;
        })
        .on("end", async () => {
          let querystring = require("querystring");
          let pathquery = querystring.stringify({
            xml: chunked
          });
          let call = https
            .get(
              `https://api.factmaven.com/xml-to-json/?${pathquery}`,
              resp => {
                let chunked = "";

                // A chunk of data has been received.
                resp.on("data", chunk => {
                  chunked += chunk;
                });

                // The whole response has been received.
                resp.on("end", () => {
                  req.body = JSON.parse(chunked).root;
                  resolve();
                });
              }
            )
            .on("error", err => {
              console.log("Error: " + err.message);
            })
            .end();
        });
    });

  }

  parseJSONBody = async (req) => {
    return new Promise((resolve, reject) => {
      let chunked = "";
      req
        .on("error", err => {
          console.error(err);
          reject(err);
        })
        .on("data", chunk => {
          chunked += chunk;
        })
        .on("end", async () => {
          try {

            req.body = JSON.parse(chunked);
            resolve();
          } catch (err) {
            reject(err);
          }
        });
    });
  }
}

// const CreateResponseObject = require("./CreateResponseObject.js")
// const { Errors } = require("../exception/index.js")

// const { URLNotFoundError } = Errors;

//  class ServerSetup {

//     static returnListenFunction = (server) => (port, callback) => server.listen(port, callback);

//     static parseRequestData(body, contentType) {
//         let data;

//         if(contentType === "application/json") {
//             data = body.length > 0 ? JSON.parse(body) : body;
//         } else if(contentType === "application/x-www-form-urlencoded") {
//             data = {};
//             const formEntries = body.split('&');

//             for(let pair of formEntries) {
//                 const [key, value] = pair.split('=');
//                 data[key] = decodeURIComponent(value);
//             }
//         }

//         return data;
//     }

//     static processRequest = (req, newResponseObject, routes) => {
//         let status;

//         try {
//             // trim url of forward slashes on both ends
//             const urlPathname = req.url.replace(/^\/+|\/+$/g, "");

//             const method = req.method;
//             const controllerFunctions = routes[method][urlPathname];

//             // method:url match not found
//             if(!controllerFunctions) {
//                 status = 404;
//                 throw new URLNotFoundError;
//             }

//             if(controllerFunctions.length === 1) {
//                 controllerFunctions[0](req, newResponseObject);
//                 return newResponseObject.res.end(newResponseObject.resData);
//             } else {
//                 // if middleware exixts, run them one after another
//                 for(let counter = 0; counter < controllerFunctions.length; counter++) {
//                     controllerFunctions[counter](req, newResponseObject, "NEXT_FUNCTION_RETURN_VALUE");

//                     if(newResponseObject.resData) {
//                         return newResponseObject.res.end(newResponseObject.resData);
//                     }
//                 }
//             }

//         } catch(e) {
//             status = status ?? 500;
//             newResponseObject.status(status).send(null, [e.message]);

//             return newResponseObject.res.end(newResponseObject.resData);
//         }
//     }


//     static returnRequestHandler = (routes) => async (req, res) => {

//         // extend the res object to provide useful add-on methods
//         const acceptsContentType = req.headers['accept'];
//         const newResponseObject = new CreateResponseObject(req, res, acceptsContentType);

//         let body = "";

//         if(['POST', 'PUT', 'PATCH'].includes(req.method)) {

//             req.on('data', (chunk) => {
//                 body += chunk;
//             });

//             req.on('end', () => {
//                 req.body = ServerSetup.parseRequestData(body, req.headers['content-type']);
//                 return ServerSetup.processRequest(req, newResponseObject, routes);
//             });
//         } else {
//             req.body = {};
//             return ServerSetup.processRequest(req, newResponseObject, routes);
//         }

//     }
// }



module.exports = ServerInit