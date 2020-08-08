export interface Validator<T> {
  validate(data: T): ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  error: {};
}

export class TypeGuards {
  public static isString(data: any): data is string {
    return typeof data === "string";
  }
}
