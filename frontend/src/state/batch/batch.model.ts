import { IBatchDetails } from "src/services/batch/batch.model";

export interface IBatchState {
  batchData: {
    loading: boolean;
    hasErrors: boolean;
    message: string;
    data: IBatchDetails;
  };
  createBatches: {
    loading: boolean;
    hasErrors: boolean;
    message: string;
  };
  editById: {
    loading: boolean;
    hasErrors: boolean;
    message: string;
  };
  removeById: {
    loading: boolean;
    hasErrors: boolean;
    message: string;
  };
  updateById: {
    loading: boolean;
    hasErrors: boolean;
    message: string;
  };
}
