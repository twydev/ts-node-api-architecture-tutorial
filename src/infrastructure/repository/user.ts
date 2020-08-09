import { Repository } from "../repository";
import { User } from "../../domain/user";
import { Database, DbRequest, DbResponse } from "../database";
import { Account } from "../../domain/account";
import { AccountRepository } from "./account";

export interface UserRepository extends Repository<User> {
  // UserRepo specific query, extending from base repo
  getAll(): Promise<User[]>;
}

export interface UserRepoInitParams {
  database: Database;
  collections: {
    user: string;
  };
  repositories: {
    account: AccountRepository;
  };
}

export interface UserRecord {
  id: string;
  username: string;
  accountIds: string[];
}

// TODO: how to avoid naming interface with "I" prefix, and implementation with "Impl" suffix
export class UserRepositoryImpl implements UserRepository {
  public static initialize(params: UserRepoInitParams) {
    return new UserRepositoryImpl(
      params.database,
      params.collections,
      params.repositories
    );
  }

  constructor(
    private database: Database,
    private collections: { user: string },
    private repositories: { account: AccountRepository }
  ) {}

  async getAll(): Promise<User[]> {
    const userDbRequest: DbRequest = {
      collection: this.collections.user,
      key: "",
      data: {},
    };
    const userDbResponse = await this.database.read(userDbRequest, true);
    this.errorHandler(userDbResponse);

    const rawUsers: UserRecord[] = userDbResponse.data;
    return Promise.all(
      rawUsers.map(async (rawUser) => {
        return this.userRecordToDomain(rawUser);
      })
    );
  }

  async getById(id: string): Promise<User> {
    const userDbRequest: DbRequest = {
      collection: this.collections.user,
      key: id,
      data: {},
    };
    const userDbResponse = await this.database.read(userDbRequest);
    this.errorHandler(userDbResponse);

    const rawUser: UserRecord = userDbResponse.data;
    return this.userRecordToDomain(rawUser);
  }

  async create(user: User): Promise<User> {
    const userDbRequest: DbRequest = {
      collection: this.collections.user,
      key: user.id,
      data: this.userDomainToRecord(user),
    };
    const userDbResponse = await this.database.create(userDbRequest);
    this.errorHandler(userDbResponse);

    await Promise.all(
      user.accounts.map((account) => {
        return this.repositories.account.upsert(account, user.id);
      })
    );

    const rawUser: UserRecord = userDbResponse.data;
    return this.userRecordToDomain(rawUser);
  }

  async update(user: User): Promise<User> {
    const userDbRequest: DbRequest = {
      collection: this.collections.user,
      key: user.id,
      data: this.userDomainToRecord(user),
    };
    const userDbResponse = await this.database.update(userDbRequest);
    this.errorHandler(userDbResponse);

    await Promise.all(
      user.accounts.map((account) => {
        return this.repositories.account.upsert(account, user.id);
      })
    );

    const rawUser: UserRecord = userDbResponse.data;
    return this.userRecordToDomain(rawUser);
  }

  async delete(id: string): Promise<User> {
    const userDbRequest: DbRequest = {
      collection: this.collections.user,
      key: id,
      data: {},
    };
    const userDbResponse = await this.database.delete(userDbRequest);
    this.errorHandler(userDbResponse);

    const rawUser: UserRecord = userDbResponse.data;
    const user = await this.userRecordToDomain(rawUser);

    await Promise.all(
      user.accounts.map((account) => {
        return this.repositories.account.delete(account.id);
      })
    );

    return user;
  }

  private errorHandler(response: DbResponse) {
    if (response.status === "failure")
      throw new Error(`UserRepository Error: ${response.error.message}`);
  }

  private async userRecordToDomain(rawUser: UserRecord): Promise<User> {
    const accounts: Account[] = await Promise.all(
      rawUser.accountIds.map((accountId) => {
        return this.repositories.account.getById(accountId);
      })
    );
    const user = User.create({
      id: rawUser.id,
      username: rawUser.username,
      accounts,
    });
    return user;
  }

  private userDomainToRecord(user: User): UserRecord {
    const userDto = user.unmarshall();
    return {
      id: userDto.id,
      username: userDto.username,
      accountIds: userDto.accounts.map((account) => account.id),
    };
  }
}
