import { Entity } from "./entity";

export interface CreateAccountParams {
  id?: string;
  balance: number;
}

export class Account extends Entity {
  // Decision: use a factory-style static method to create entity to allow validation of params
  public static create(params: CreateAccountParams) {
    if (!Account.isValidBalance(params.balance))
      throw new Error("Invalid Account balance!");

    return new Account(params.balance, params.id);
  }

  public static isValidBalance(balance: number) {
    return balance >= 0;
  }

  public get balance(): number {
    return this._balance;
  }

  // Decision: constructor is private to prevent unsafe creation of invalid Account states
  private constructor(private _balance: number, id?: string) {
    super(id);
  }
}
