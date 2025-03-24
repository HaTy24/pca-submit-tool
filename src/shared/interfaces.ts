export interface FindOptions {
  sort: Record<string, number>;
  select: Record<string, number>;
  populate: any[];
}
