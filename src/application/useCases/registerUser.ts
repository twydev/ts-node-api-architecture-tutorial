import { Interactor } from "../interactor";
import { Validator, TypeGuards } from "../validator";
import { User, UnmarshalledUser } from "../../domain/user";
import { UserRepository } from "../../infrastructure/repository/user";

export interface RegisterUserRequest {
  username: string;
}

export interface RegisterUserResult extends UnmarshalledUser {}

export class RegisterUserRequestValidator
  implements Validator<RegisterUserRequest> {
  validate(request: RegisterUserRequest) {
    // TODO: refactor to use standardized acceptable inputs, with validation checks using a separate lib
    if (!TypeGuards.isString(request.username)) {
      return {
        valid: false,
        error: {
          path: "username",
          message: `username is not a 'String'`,
        },
      };
    }
    return {
      valid: true,
      error: {},
    };
  }
}

export class RegisterUser
  implements Interactor<RegisterUserRequest, RegisterUserResult> {
  constructor(
    private requestValidator: Validator<RegisterUserRequest>,
    private userRepo: UserRepository
  ) {}

  async execute(request: RegisterUserRequest): Promise<RegisterUserResult> {
    const result = this.requestValidator.validate(request);

    if (!result.valid) {
      // TODO: refactor to use either an error factory, or nested error stack
      throw result.error;
    }

    try {
      const user = User.create({ username: request.username });
      const createdUser = await this.userRepo.create(user);

      return createdUser.unmarshall();
    } catch (err) {
      throw { error: "Failed to register new user" };
    }
  }
}
