import { UserRepository, UserRepositoryImpl } from "../user";
import { LocalMemoryDb } from "../../database/localMemory";
import { AccountRepositoryImpl } from "../account";
import { Database } from "../../database";
import { User } from "../../../domain/user";
import { Account } from "../../../domain/account";

describe("UserRepository", () => {
  let userRepo: UserRepository;
  let db: Database;

  beforeEach(() => {
    db = LocalMemoryDb.initialize({ collections: ["user", "account"] });
    const accountRepo = AccountRepositoryImpl.initialize({
      database: db,
      collections: { account: "account" },
    });
    userRepo = UserRepositoryImpl.initialize({
      database: db,
      collections: { user: "user" },
      repositories: { account: accountRepo },
    });
  });

  it("should create new user", async () => {
    const account = Account.create({ balance: 420 });
    const user = User.create({ username: "mockUser", accounts: [account] });
    await userRepo.create(user);
    const dumps = db.dump();
    expect(dumps).toMatch("mockUser");
    return expect(dumps).toMatch("420");
  });

  it("should update user", async () => {
    const account = Account.create({ balance: 420 });
    const user = User.create({ username: "mockUser", accounts: [account] });
    await userRepo.create(user);
    expect(db.dump()).toMatch("420");

    account.deposit(420);
    await userRepo.update(user);
    const dumps = db.dump();
    expect(dumps).not.toMatch("420");
    return expect(dumps).toMatch("840");
  });

  it("should return a user", async () => {
    const account = Account.create({ balance: 420 });
    const user = User.create({ username: "mockUser", accounts: [account] });
    await userRepo.create(user);
    const retrievedUser = await userRepo.getById(user.id);
    return expect(retrievedUser).toEqual(user);
  });

  it("should delete a user", async () => {
    const account = Account.create({ balance: 420 });
    const user = User.create({ username: "mockUser", accounts: [account] });
    await userRepo.create(user);
    await userRepo.delete(user.id);
    return expect(db.dump()).not.toMatch("mockUser");
  });

  it("should return all users", async () => {
    const account1 = Account.create({ balance: 420 });
    const user1 = User.create({ username: "mockUser", accounts: [account1] });
    await userRepo.create(user1);

    const account2 = Account.create({ balance: 420 });
    const user2 = User.create({ username: "mockUser", accounts: [account2] });
    await userRepo.create(user2);

    const retrievedUsers = await userRepo.getAll();
    return expect(retrievedUsers).toMatchObject(
      expect.arrayContaining([
        expect.objectContaining(user1),
        expect.objectContaining(user2),
      ])
    );
  });
});
