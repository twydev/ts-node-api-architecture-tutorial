import { Validator } from "../validator";
import {
  RegisterAccountRequest,
  RegisterAccountResult,
  RegisterAccount,
} from "./registerAccount";
import { Interactor } from "../interactor";

describe("RegisterAccount", () => {
  const mockValidator: Validator<RegisterAccountRequest> = {
    validate: jest.fn(),
  };
  const registerAccountInteractor: Interactor<
    RegisterAccountRequest,
    RegisterAccountResult
  > = new RegisterAccount(mockValidator);

  it("should register account successfully", async () => {
    const properRequest: RegisterAccountRequest = {
      userId: "mockUUID",
    };
    return expect(
      registerAccountInteractor.execute(properRequest)
    ).toMatchObject({
      userId: "mockUUID",
      accountId: "mockAccountId",
    });
  });

  it("should throw error if request is invalid", async () => {
    const invalidRequest = {
      userId: null,
    } as unknown;

    return expect(() =>
      registerAccountInteractor.execute(
        invalidRequest as RegisterAccountRequest
      )
    ).toThrowError();
  });
});
