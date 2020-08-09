import { Controller } from "./controller";
import { Interactor } from "../../application/interactor";
import {
  RegisterUserRequest,
  RegisterUserResult,
} from "../../application/useCases/registerUser";
import {
  RegisterAccountRequest,
  RegisterAccountResult,
} from "../../application/useCases/registerAccount";
import { UserRepository } from "../repository/user";

export interface UserControllerUseCases {
  registerUserInteractor: Interactor<RegisterUserRequest, RegisterUserResult>;
  registerAccountInteractor: Interactor<
    RegisterAccountRequest,
    RegisterAccountResult
  >;
}

export interface RegisterUserDto {
  username: string;
  authorized: boolean;
}

export interface RegisterAccountDto {
  userId: string;
  authorized: boolean;
}

export interface GetAllUsersDto {
  authorized: boolean;
}

// TODO: implement validation for API request
export class UserController extends Controller {
  constructor(
    private useCase: UserControllerUseCases,
    private repository: UserRepository
  ) {
    super("User");
  }

  async registerUser(registerUserDto: RegisterUserDto) {
    if (!registerUserDto.authorized) {
      return this.createFailureResponse({ message: "Unauthorized" });
    }

    const registerUserRequest: RegisterUserRequest = {
      username: registerUserDto.username,
    };
    try {
      const response = await this.useCase.registerUserInteractor.execute(
        registerUserRequest
      );
      return this.createSuccessResponse(response);
    } catch (err) {
      return this.createFailureResponse(err, 500);
    }
  }

  async registerAccount(registerAccountDto: RegisterAccountDto) {
    if (!registerAccountDto.authorized) {
      return this.createFailureResponse({ message: "Unauthorized" });
    }

    const registerAccountRequest: RegisterAccountRequest = {
      userId: registerAccountDto.userId,
    };
    try {
      const response = await this.useCase.registerAccountInteractor.execute(
        registerAccountRequest
      );
      return this.createSuccessResponse(response);
    } catch (err) {
      return this.createFailureResponse(err, 500);
    }
  }

  // TODO: consider if Domain and Repository should be exposed to the controller at all?
  async getAllUsers(getAllUsersDto: GetAllUsersDto) {
    if (!getAllUsersDto.authorized) {
      return this.createFailureResponse({ message: "Unauthorized" });
    }

    try {
      const users = await this.repository.getAll();
      const response = users.map((user) => user.unmarshall());
      return this.createSuccessResponse(response);
    } catch (err) {
      return this.createFailureResponse(err, 500);
    }
  }
}
