import { Type } from 'class-transformer';
import { Min, IsOptional, Max, IsString } from 'class-validator';

export class PaginationDTO {
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  offset?: number;

  @Min(1)
  @Max(200)
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @IsString()
  @IsOptional()
  sort?: string;

  // Purpose is to disallow external services to touch the original filter
  protected _filter: Record<string, any> = {};

  public get filter(): Record<string, any> {
    return this._filter;
  }

  public addFilter(newFilter: Record<string, any>): void {
    this._filter = Object.assign(this._filter, newFilter);
  }
}
