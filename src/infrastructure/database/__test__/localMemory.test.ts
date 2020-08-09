import { LocalMemoryDb, LocalMemoryDbInitParams } from "../localMemory";

describe("LocalMemory", () => {
  it("should initialize successfully", () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user", "account"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    const dumps = db.dump();
    expect(dumps).toMatch("user");
    expect(dumps).toMatch("account");
  });

  it("should create new key value", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    await db.create({
      collection: "user",
      key: "userId-1",
      data: { username: "username-1" },
    });
    return expect(db.dump()).toMatch("username-1");
  });

  it("should read existing key value", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    await db.create({
      collection: "user",
      key: "userId-1",
      data: { username: "username-1" },
    });
    return expect(
      db.read({
        collection: "user",
        key: "userId-1",
        data: {},
      })
    ).resolves.toMatchObject({
      status: "success",
      data: { username: "username-1" },
      error: {},
    });
  });

  it("should read all values in a collection", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    await db.create({
      collection: "user",
      key: "userId-1",
      data: { username: "username-1" },
    });
    await db.create({
      collection: "user",
      key: "userId-2",
      data: { username: "username-2" },
    });
    await db.create({
      collection: "user",
      key: "userId-3",
      data: { username: "username-3" },
    });
    return expect(
      db.read(
        {
          collection: "user",
          key: "",
          data: {},
        },
        true
      )
    ).resolves.toMatchObject({
      status: "success",
      data: expect.arrayContaining([
        { username: "username-1" },
        { username: "username-2" },
        { username: "username-3" },
      ]),
      error: {},
    });
  });

  it("should update existing key value", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    await db.create({
      collection: "user",
      key: "userId-1",
      data: { username: "username-1" },
    });
    await db.update({
      collection: "user",
      key: "userId-1",
      data: { username: "username-2" },
    });
    const dumps = db.dump();
    expect(dumps).toMatch("username-2");
    return expect(dumps).not.toMatch("username-1");
  });

  it("should delete existing key value", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    await db.create({
      collection: "user",
      key: "userId-1",
      data: { username: "username-1" },
    });
    await db.delete({
      collection: "user",
      key: "userId-1",
      data: {},
    });
    const dumps = db.dump();
    return expect(dumps).not.toMatch("username-1");
  });

  it("should return failure response if collection do not exists", async () => {
    const initParams: LocalMemoryDbInitParams = {
      collections: ["user"],
    };
    const db = LocalMemoryDb.initialize(initParams);
    return expect(
      db.create({
        collection: "account",
        key: "userId-1",
        data: { username: "username-1" },
      })
    ).resolves.toMatchObject({
      status: "failure",
      data: {},
      error: {
        message: expect.any(String),
      },
    });
  });
});
