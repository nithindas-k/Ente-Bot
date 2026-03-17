export interface IBaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(filter?: object): Promise<T[]>;
    create(data: any): Promise<T>;
    update(id: string, data: any): Promise<T | null>;
    delete(id: string): Promise<T | null>;
    deleteMany(filter?: object): Promise<any>;
}
