import { IMetaProps } from "src/components/Pagination/Pagination.model";

export interface IBatch {
  id?: number;
  name: string;
  code: string;
  duration: number;
  status: boolean;
}

export interface IBatchDetails {
  rows: IBatch[];
  meta: IMetaProps;
}

export interface IBatchStatus {
  id: number;
  status: boolean;
}
