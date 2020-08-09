export interface DbRequest {
  collection: string;
  key: string;
  data: any;
}

export interface DbResponse {
  status: "success" | "failure";
  data: any;
  error: {
    message?: string;
  };
}

export interface Database {
  create(request: DbRequest): Promise<DbResponse>;
  read(request: DbRequest, all?: boolean): Promise<DbResponse>;
  update(request: DbRequest): Promise<DbResponse>;
  delete(request: DbRequest): Promise<DbResponse>;
  dump(): string;
}
