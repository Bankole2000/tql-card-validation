class BuildXMLData {
  
  static build(result, isError) {
      let stringifiedData = "";
      const res = result.data ?? result.error;

      if(Array.isArray(res)) {
          for(let key in res) {
              stringifiedData += `<error key="${key}">${res[key]}</error>`
          }
      } else {
          for(let key in res) {
              stringifiedData += `<${key}>${res[key]}</${key}>`
          }
      }

      const wrappedResponse = isError ?
          `<Data>${stringifiedData}</Data>`
          : `<Error>${stringifiedData}</Error>`

      const xml = `<Response>
                      <Status>${result.status}</Status>
                      ${wrappedResponse}
                  </Response>`
      return xml;
  }
}


class ResponseObject {

  constructor(req, res) {
      this.res = res;
      this.req = req;
      this.resFormat = "";

      this.format();
      this.statusCode = 400;

      this.resData = null;
  }

  status(statusCode) {
      this.statusCode = statusCode;
      return this;
  }

  format() {
      if(this.req.headers['content-type'] == 'application/xml'){
        this.resFormat =  'xml';
        return this;
      }
      this.resFormat = 'json';
      return this;
  }

  send(data, error = null) {
      const result = data ? { status: this.statusCode, data } : { status: this.statusCode, error }
      if(this.resFormat === "xml") {
          return this.xml(result);
      }
      return this.json(result);
  }
  
  json(result) {
      this.res.writeHead(this.statusCode, { 'Content-Type' : 'application/json'});
      result.status = result.status ?? this.statusCode;
      this.resData = JSON.stringify(result)
  }

  xml(result) {
      const isError = !result.error;
      result.status = result.status ?? this.statusCode;
      this.res.writeHead(this.statusCode, { 'Content-Type' : 'application/xml'});
      this.resData = BuildXMLData.build(result, isError);
  }
}

module.exports = ResponseObject