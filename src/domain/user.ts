import { Entity } from "./entity";
import { Account, UnmarshalledAccount } from "./account";

export interface CreateUserParams {
  id?: string;
  username: string;
  accounts?: Account[];
}

export interface UnmarshalledUser {
  id: string;
  username: string;
  accounts: UnmarshalledAccount[];
}

export class User extends Entity {
  private _accounts: Account[];

  public static create(params: CreateUserParams) {
    // TODO: should this throw error?
    if (!User.isValidUsername(params.username))
      throw new Error("Invalid username!");

    const user = new User(params.username, params.id);

    if (params.accounts) {
      user.accounts = params.accounts;
    }

    return user;
  }

  public static isValidUsername(username: string) {
    return username.length > 6;
  }

  public get username(): string {
    return this._username;
  }

  public set accounts(accounts: Account[]) {
    this._accounts = accounts;
  }

  public get accounts() {
    return this._accounts;
  }

  public addAccount(account: Account) {
    this._accounts.push(account);
  }

  public unmarshall(): UnmarshalledUser {
    return {
      id: this.id,
      username: this._username,
      accounts: this._accounts.map((account) => {
        return account.unmarshall();
      }),
    };
  }

  // Decision: constructor is private to prevent unsafe creation of invalid Account states
  private constructor(private _username: string, id?: string) {
    super(id);
    this._accounts = [];
  }
}
