import { Database, DbRequest, DbResponse } from "../database";

export interface LocalMemoryDbRequest extends DbRequest {}

export interface LocalMemoryDbResponse extends DbResponse {}

export interface LocalMemoryDbInitParams {
  collections: string[];
}

interface Collection extends Map<string, any> {}

enum LocalMemoryDbErrorMessage {
  MISSING_COLLECTION = "Collection not found.",
  MISSING_KEY = "Key does not exists.",
  KEY_EXISTS = "Key already exists in collection.",
  DELETE_ERROR = "Failed to delete.",
}

export class LocalMemoryDb implements Database {
  public static initialize(params: LocalMemoryDbInitParams) {
    const map = new Map<string, any>();
    params.collections.forEach((collectionName) => {
      map.set(collectionName, new Map<string, any>());
    });
    return new LocalMemoryDb(map);
  }

  private constructor(private collections: Map<string, Collection>) {}

  private async requestHandlerHoc(
    request: LocalMemoryDbRequest,
    callback: () => LocalMemoryDbResponse
  ) {
    if (!this.collections.has(request.collection)) {
      return this.failureResponse(LocalMemoryDbErrorMessage.MISSING_COLLECTION);
    }
    return callback();
  }

  async create(request: LocalMemoryDbRequest): Promise<LocalMemoryDbResponse> {
    return this.requestHandlerHoc(
      request,
      (): LocalMemoryDbResponse => {
        const collection = this.collections.get(
          request.collection
        ) as Collection;
        if (collection.has(request.key)) {
          return this.failureResponse(LocalMemoryDbErrorMessage.KEY_EXISTS);
        }
        collection.set(request.key, request.data);
        return this.successResponse(request.data);
      }
    );
  }

  async read(
    request: LocalMemoryDbRequest,
    all: boolean = false
  ): Promise<LocalMemoryDbResponse> {
    return this.requestHandlerHoc(
      request,
      (): LocalMemoryDbResponse => {
        const collection = this.collections.get(
          request.collection
        ) as Collection;

        if (all) {
          const allValues: any[] = [];
          collection.forEach((value) => {
            allValues.push(value);
          });
          return this.successResponse(allValues);
        }

        if (!collection.has(request.key)) {
          return this.failureResponse(LocalMemoryDbErrorMessage.MISSING_KEY);
        }
        const value = collection.get(request.key);
        return this.successResponse(value);
      }
    );
  }

  async update(request: LocalMemoryDbRequest): Promise<LocalMemoryDbResponse> {
    return this.requestHandlerHoc(
      request,
      (): LocalMemoryDbResponse => {
        const collection = this.collections.get(
          request.collection
        ) as Collection;
        if (!collection.has(request.key)) {
          return this.failureResponse(LocalMemoryDbErrorMessage.MISSING_KEY);
        }
        collection.set(request.key, request.data);
        return this.successResponse(request.data);
      }
    );
  }

  async delete(request: LocalMemoryDbRequest): Promise<LocalMemoryDbResponse> {
    return this.requestHandlerHoc(
      request,
      (): LocalMemoryDbResponse => {
        const collection = this.collections.get(
          request.collection
        ) as Collection;
        if (!collection.has(request.key)) {
          return this.failureResponse(LocalMemoryDbErrorMessage.MISSING_KEY);
        }

        const value = collection.get(request.key);
        if (!collection.delete(request.key)) {
          return this.failureResponse(LocalMemoryDbErrorMessage.DELETE_ERROR);
        }
        return this.successResponse(value);
      }
    );
  }

  private failureResponse(
    message: LocalMemoryDbErrorMessage
  ): LocalMemoryDbResponse {
    return {
      status: "failure",
      data: null,
      error: {
        message,
      },
    };
  }

  private successResponse(data: any): LocalMemoryDbResponse {
    return {
      status: "success",
      data,
      error: {},
    };
  }

  public dump(): string {
    const dumps: string[] = [];
    this.collections.forEach(
      (collection: Collection, collectionName: string) => {
        dumps.push(`Collection: ${collectionName}`);
        collection.forEach((value: any, key: string) => {
          dumps.push(`${collectionName}[${key}] = ${JSON.stringify(value)}`);
        });
      }
    );
    return JSON.stringify(dumps);
  }
}
