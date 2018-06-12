// content of index.js
const http = require('http');
const path = require('path');
const url = require('url');
const fs = require('fs');
const port = process.env.PORT || 8080;
const mimeTypes = {
  html: 'text/html',
  jpeg: 'image/jpeg',
  jpg: 'image/jpg',
  png: 'image/png',
  js: 'text/javascript',
  css: 'text/css',
  json: 'application/json',
  csv: 'text/csv'
};

const requestHandler = (req, res) => {
  var pathname = url.parse(req.url).pathname;
  var filename;
  if (pathname === "/") {
    filename = "index.html";
  } else {
    filename = path.join(process.cwd(), pathname);
  }

  try {
    fs.accessSync(filename, fs.F_OK);
    var fileStream = fs.createReadStream(filename);
    var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
    res.writeHead(200, { 'Content-Type': mimeType });
    fileStream.pipe(res);
  }
  catch (e) {
    console.log('File not exists: ' + filename);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('404 Not Found\n');
    res.end();
    return;
  }
}

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
});