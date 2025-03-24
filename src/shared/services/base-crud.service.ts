import { ClientSession, Model } from 'mongoose';
import { FindOptions } from '../interfaces';
import { PaginationDTO } from '../dtos';

export class BaseCRUDService {
  constructor(protected domainModel: Model<any, any>) {}

  public get model(): Model<any, any> {
    return this.domainModel;
  }

  protected parseLimit(limit: number) {
    return limit || 10;
  }

  protected parseSkip(offset: number) {
    return offset || 0;
  }

  public getOne(filter: any = {}, options: Partial<FindOptions> = {}) {
    const query = this.domainModel.findOne({
      ...filter,
      deletedAt: null,
    });

    if (options.select) {
      query.select(options.select);
    }

    if (options.populate) {
      query.populate(options.populate);
    }

    if (options.sort) {
      query.sort(options.sort);
    }

    return query.exec();
  }

  public count(filter: any = {}) {
    return this.domainModel.countDocuments({
      ...filter,
      deletedAt: null,
    });
  }

  public async paginate(
    pagingDTO: PaginationDTO,
    options: Partial<FindOptions> = {},
  ) {
    const { limit = 10, offset = 0, filter } = pagingDTO || {};

    const total = await this.domainModel.countDocuments({
      ...filter,
      deletedAt: null,
    });

    const findQuery = this.domainModel
      .find({
        ...filter,
        deletedAt: null,
      })

      .skip(this.parseSkip(offset))
      .limit(this.parseLimit(limit));

    if (pagingDTO.sort || options.sort) {
      findQuery.sort(options.sort || pagingDTO.sort);
    }

    if (options.populate) {
      findQuery.populate(options.populate);
    }

    if (options.select) {
      findQuery.select = options.select;
    }

    const rows = await findQuery.exec();

    return {
      rows,
      total,
      limit,
      offset,
    };
  }

  public async getAll(filter?: any, options: Partial<FindOptions> = {}) {
    const findQuery = this.domainModel.find({
      ...filter,
      deletedAt: null,
    });

    if (options.sort) {
      findQuery.sort(options.sort);
    }

    if (options.populate) {
      findQuery.populate(options.populate);
    }

    if (options.select) {
      findQuery.select = options.select;
    }

    const rows = await findQuery.exec();

    return rows;
  }

  public getById(
    _id: string,
    options: Partial<FindOptions> = {},
    session?: ClientSession,
  ) {
    const findQuery = this.domainModel.findOne({ _id, deletedAt: null });

    if (options.populate) {
      findQuery.populate(options.populate);
    }

    if (options.select) {
      findQuery.select(options.select);
    }

    if (session) {
      findQuery.session(session);
    }

    return findQuery.exec();
  }

  public async create(createDTO: any, session?: ClientSession) {
    const newModels = await this.domainModel.create([createDTO], { session });

    const created = newModels[0];

    return created?.save();
  }

  public async bulkCreate(payload: any[]): Promise<void> {
    await this.domainModel.insertMany(payload);
  }

  public updateById(id: string, updateDTO: any, session?: ClientSession) {
    return this.domainModel.findByIdAndUpdate(id, updateDTO, { session });
  }

  public updateOne(filter: any, updateDTO: any) {
    return this.domainModel.findOneAndUpdate(filter, updateDTO, { new: true });
  }

  public updateOneWithSession(
    filter: any,
    updateDTO: any,
    session: ClientSession,
  ) {
    return this.domainModel.findOneAndUpdate(filter, updateDTO, {
      new: true,
      session,
    });
  }

  public bulkUpdate(criteria: any, updateDTO: any) {
    return this.domainModel.updateMany(criteria, updateDTO, {
      new: true,
    });
  }

  public deleteById(id: string) {
    return this.domainModel.findByIdAndUpdate(id, {
      deletedAt: new Date(),
    });
  }

  public forceDeleteById(id: string) {
    return this.domainModel.findByIdAndDelete(id);
  }

  public bulkDelete(filter: any) {
    return this.domainModel.deleteMany(filter);
  }
}
