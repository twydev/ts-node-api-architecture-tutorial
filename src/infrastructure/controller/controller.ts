export interface ControllerReponse {
  status: number;
  head: {
    [key: string]: string;
  };
  body: string;
}

export abstract class Controller {
  constructor(private type: string) {}

  createSuccessResponse(responseBody: any): ControllerReponse {
    return {
      status: 200,
      head: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: responseBody,
        type: this.type,
      }),
    };
  }

  createFailureResponse(
    responseBody: any,
    status: number = 400
  ): ControllerReponse {
    return {
      status,
      head: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: responseBody,
      }),
    };
  }
}
