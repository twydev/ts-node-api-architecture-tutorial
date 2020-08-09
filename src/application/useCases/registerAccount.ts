import { Interactor } from "../interactor";
import { Validator, TypeGuards } from "../validator";
import { Account } from "../../domain/account";
import { UserRepository } from "../../infrastructure/repository/user";

export interface RegisterAccountRequest {
  userId: string;
}

export interface RegisterAccountResult {
  userId: string;
  accountId: string;
}

export class RegisterAccountRequestValidator
  implements Validator<RegisterAccountRequest> {
  validate(request: RegisterAccountRequest) {
    // TODO: refactor to use standardized acceptable inputs, with validation checks using a separate lib
    if (!TypeGuards.isString(request.userId)) {
      return {
        valid: false,
        error: {
          path: "userId",
          message: `userId is not a 'String'`,
        },
      };
    }
    return {
      valid: true,
      error: {},
    };
  }
}

export class RegisterAccount
  implements Interactor<RegisterAccountRequest, RegisterAccountResult> {
  constructor(
    private requestValidator: Validator<RegisterAccountRequest>,
    private userRepo: UserRepository
  ) {}

  async execute(
    request: RegisterAccountRequest
  ): Promise<RegisterAccountResult> {
    const result = this.requestValidator.validate(request);
    if (!result.valid) {
      // TODO: refactor to use either an error factory, or nested error stack
      throw result.error;
    }

    try {
      const newAccount = Account.create({ balance: 0 });
      const user = await this.userRepo.getById(request.userId);
      user.addAccount(newAccount);
      await this.userRepo.update(user);

      return {
        userId: user.id,
        accountId: newAccount.id,
      };
    } catch (err) {
      // TODO: decide if interactor should throw error or return failure response
      throw { error: "Failed to register new account" };
    }
  }
}
