import { Interactor } from "../interactor";
import { Validator, TypeGuards } from "../validator";

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
    if (!TypeGuards.isString(request)) {
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
  constructor(private requestValidator: Validator<RegisterAccountRequest>) {}

  async execute(
    request: RegisterAccountRequest
  ): Promise<RegisterAccountResult> {
    const result = this.requestValidator.validate(request);

    if (!result.valid) {
      // TODO: refactor to use either an error factory, or nested error stack
      throw new Error(JSON.stringify(result.error));
    }

    // TODO: implement processing

    return {
      userId: request.userId,
      accountId: "mockAccountId",
    };
  }
}
