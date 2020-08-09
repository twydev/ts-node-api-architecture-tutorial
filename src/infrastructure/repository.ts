export interface Repository<T> {
  getById(id: string): Promise<T>;
  create(data: T, extra?: any): Promise<T>;
  update(data: T, extra?: any): Promise<T>;
  delete(id: string): Promise<T>;
}
