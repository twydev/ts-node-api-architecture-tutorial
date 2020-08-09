import { Account } from "../../domain/account";
import { Repository } from "../repository";
import { Database, DbRequest, DbResponse } from "../database";

export interface AccountRepository extends Repository<Account> {
  upsert(account: Account, userId: string): Promise<Account>;
}

export interface AccountRepoInitParams {
  database: Database;
  collections: {
    account: string;
  };
}

export interface AccountRecord {
  id: string;
  balance: number;
  userId: string;
}

export class AccountRepositoryImpl implements AccountRepository {
  public static initialize(params: AccountRepoInitParams) {
    return new AccountRepositoryImpl(params.database, params.collections);
  }

  constructor(
    private database: Database,
    private collections: { account: string }
  ) {}

  async upsert(account: Account, userId: string): Promise<Account> {
    const accountDbRequest: DbRequest = {
      collection: this.collections.account,
      key: account.id,
      data: this.accountDomainToRecord(account, userId),
    };
    const accountDbResponse = await this.database.read(accountDbRequest);

    let upsertResponse: DbResponse;
    if (accountDbResponse.status === "failure") {
      upsertResponse = await this.database.create(accountDbRequest);
    } else {
      upsertResponse = await this.database.update(accountDbRequest);
    }

    this.errorHandler(upsertResponse);
    const rawAccount = upsertResponse.data;
    return this.accountRecordToDomain(rawAccount);
  }

  async create(account: Account, userId: string): Promise<Account> {
    const accountDbRequest: DbRequest = {
      collection: this.collections.account,
      key: account.id,
      data: this.accountDomainToRecord(account, userId),
    };
    const accountDbResponse = await this.database.create(accountDbRequest);
    this.errorHandler(accountDbResponse);

    const rawAccount: AccountRecord = accountDbResponse.data;
    return this.accountRecordToDomain(rawAccount);
  }

  async update(account: Account, userId: string): Promise<Account> {
    const accountDbRequest: DbRequest = {
      collection: this.collections.account,
      key: account.id,
      data: this.accountDomainToRecord(account, userId),
    };
    const accountDbResponse = await this.database.update(accountDbRequest);
    this.errorHandler(accountDbResponse);

    const rawAccount: AccountRecord = accountDbResponse.data;
    return this.accountRecordToDomain(rawAccount);
  }

  async getById(id: string): Promise<Account> {
    const accountDbRequest: DbRequest = {
      collection: this.collections.account,
      key: id,
      data: {},
    };
    const accountDbResponse = await this.database.read(accountDbRequest);
    this.errorHandler(accountDbResponse);

    const rawAccount: AccountRecord = accountDbResponse.data;
    return this.accountRecordToDomain(rawAccount);
  }

  async delete(id: string): Promise<Account> {
    const accountDbRequest: DbRequest = {
      collection: this.collections.account,
      key: id,
      data: {},
    };
    const accountDbResponse = await this.database.delete(accountDbRequest);
    this.errorHandler(accountDbResponse);

    const rawAccount: AccountRecord = accountDbResponse.data;
    return this.accountRecordToDomain(rawAccount);
  }

  private errorHandler(response: DbResponse) {
    if (response.status === "failure")
      throw new Error(`AccountRepository Error: ${response.error.message}`);
  }

  private async accountRecordToDomain(
    rawAccount: AccountRecord
  ): Promise<Account> {
    return Account.create({
      id: rawAccount.id,
      balance: rawAccount.balance,
    });
  }

  private accountDomainToRecord(
    account: Account,
    userId: string
  ): AccountRecord {
    const accountDto = account.unmarshall();
    return {
      id: accountDto.id,
      balance: accountDto.balance,
      userId,
    };
  }
}
