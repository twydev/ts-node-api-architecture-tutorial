import { Validator } from "../../validator";
import {
  RegisterAccountRequest,
  RegisterAccountResult,
  RegisterAccount,
  RegisterAccountRequestValidator,
} from "../registerAccount";
import { Interactor } from "../../interactor";
import { UserRepository } from "../../../infrastructure/repository/user";
import { User } from "../../../domain/user";

describe("RegisterAccount", () => {
  const validator: Validator<RegisterAccountRequest> = new RegisterAccountRequestValidator();
  const mockRepo: UserRepository = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const registerAccountInteractor: Interactor<
    RegisterAccountRequest,
    RegisterAccountResult
  > = new RegisterAccount(validator, mockRepo);

  it("should register account successfully", async () => {
    const properRequest: RegisterAccountRequest = {
      userId: "mockUUID",
    };
    (mockRepo.getById as jest.MockedFunction<any>).mockResolvedValue(
      User.create({ id: "mockUUID", username: "mockUserName" })
    );

    return expect(
      registerAccountInteractor.execute(properRequest)
    ).resolves.toMatchObject({
      userId: "mockUUID",
      accountId: expect.any(String),
    });
  });

  it("should throw error if request is invalid", async () => {
    const invalidRequest = {
      userId: null,
    } as unknown;

    return expect(
      registerAccountInteractor.execute(
        invalidRequest as RegisterAccountRequest
      )
    ).rejects.toBeDefined();
  });
});
