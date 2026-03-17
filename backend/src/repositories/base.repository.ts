import { Model, Document } from 'mongoose';
import { IBaseRepository } from './interfaces/IBaseRepository';

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    }

    async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    async findAll(filter: object = {}): Promise<T[]> {
        return await this.model.find(filter);
    }

    async create(data: any): Promise<T> {
        return await this.model.create(data);
    }

    async update(id: string, data: any): Promise<T | null> {
        return await this.model.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }

    async delete(id: string): Promise<T | null> {
        return await this.model.findByIdAndDelete(id);
    }
}
