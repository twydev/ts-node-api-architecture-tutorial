import http from "http";
import { UserController } from "./infrastructure/controller/user";
import {
  RegisterUser,
  RegisterUserRequestValidator,
} from "./application/useCases/registerUser";
import { LocalMemoryDb } from "./infrastructure/database/localMemory";
import { AccountRepositoryImpl } from "./infrastructure/repository/account";
import { UserRepositoryImpl } from "./infrastructure/repository/user";
import {
  RegisterAccount,
  RegisterAccountRequestValidator,
} from "./application/useCases/registerAccount";

/* Initialize Application */

// TODO: database collection names can probably be injected
// TODO: try IOC libraries, and how testing should be adjusted with the use of those libraries
const database = LocalMemoryDb.initialize({
  collections: ["users_collection", "accounts_collection"],
});

const accountRepo = AccountRepositoryImpl.initialize({
  database,
  collections: { account: "accounts_collection" },
});

const userRepo = UserRepositoryImpl.initialize({
  database,
  collections: { user: "users_collection" },
  repositories: { account: accountRepo },
});

const userController = new UserController(
  {
    registerAccountInteractor: new RegisterAccount(
      new RegisterAccountRequestValidator(),
      userRepo
    ),
    registerUserInteractor: new RegisterUser(
      new RegisterUserRequestValidator(),
      userRepo
    ),
  },
  userRepo
);

const authorizationMiddleware = (data: any) => {
  // mock implementation
  data["authorized"] = true;
  return data;
};

const server = http.createServer(function (req, res) {
  console.log(req.url, req.method);

  // TODO: refactor routing into a router
  if (req.url === "/user/account" && req.method === "POST") {
    const chunks: any[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      console.log("request: ", data);

      authorizationMiddleware(data);
      userController.registerAccount(data).then((controllerResponse) => {
        console.log("response: ", controllerResponse);
        res.writeHead(controllerResponse.status, controllerResponse.head);
        res.write(controllerResponse.body);
        res.end();
      });
    });
  } else if (req.url === "/user" && req.method === "POST") {
    const chunks: any[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const data = JSON.parse(Buffer.concat(chunks).toString());
      console.log("request: ", data);

      authorizationMiddleware(data);
      userController.registerUser(data).then((controllerResponse) => {
        console.log("response: ", controllerResponse);
        res.writeHead(controllerResponse.status, controllerResponse.head);
        res.write(controllerResponse.body);
        res.end();
      });
    });
  } else if (req.url === "/user" && req.method === "GET") {
    const data = authorizationMiddleware({});
    userController.getAllUsers(data).then((controllerResponse) => {
      console.log("response: ", controllerResponse);
      res.writeHead(controllerResponse.status, controllerResponse.head);
      res.write(controllerResponse.body);
      res.end();
    });
  } else {
    console.log("Client Bad Request");
    res.writeHead(404, { "Content-Type": "text" });
    res.write("Bad Request");
    res.end(); //end the response
  }
});

server.listen(3000, function () {
  console.log("server started. http://localhost:3000/user");
});
