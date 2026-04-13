export interface IMetaProps {
  take: number;
  itemCount: number;
  pageCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface IPaginationProps {
  meta: IMetaProps;
}
