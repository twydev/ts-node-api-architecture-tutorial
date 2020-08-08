export interface Interactor<T, U> {
  execute(request: T): Promise<U>;
}
