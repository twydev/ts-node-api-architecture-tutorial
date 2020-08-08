import { Account } from "../account";

describe("Account", () => {
  it("should create Account when balance is zero.", () => {
    expect(Account.create({ balance: 0 }) instanceof Account).toBeTruthy();
  });

  it("should create Account when balance is positive", () => {
    expect(Account.create({ balance: 1 }) instanceof Account).toBeTruthy();
  });

  it("should throw error when balance is negative", () => {
    expect(() => {
      Account.create({ balance: -1 });
    }).toThrowError();
  });

  it("should create new Account id when no id is provided", () => {
    const account = Account.create({ balance: 1 });
    expect(account?.id).toEqual(expect.any(String));
  });

  it("should create Account with id provided", () => {
    const account = Account.create({ id: "mockId", balance: 1 });
    expect(account?.id).toEqual("mockId");
  });
});
