import http from "http";

const server = http.createServer(function (req, res) {
  if (req.url === "/user") {
    console.log("Client Request User API");
    res.writeHead(200, { "Content-Type": "application/json" });
    const obj = {
      text: "helloworld",
    };
    res.write(JSON.stringify(obj));
  } else {
    console.log("Client Bad Request");
    res.writeHead(404, { "Content-Type": "text" });
    res.write("Bad Request");
  }
  res.end(); //end the response
});

server.listen(3000, function () {
  console.log("server started. http://localhost:3000/user");
});
