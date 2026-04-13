import { createAsyncThunk } from "@reduxjs/toolkit";
import { IBatchRecord } from "src/pages/Batch/batches.model";
import { IBatchStatus } from "src/services/batch/batch.model";
import batchService from "src/services/batch/batch.service";

export const searchBatchData = createAsyncThunk(
  "batch/searchBatchData",
  async (data: any) => {
    return batchService.searchBatchData(data);
  }
);
export const batchDataCount = createAsyncThunk(
  "batch/batchDataCount",
  async (data: any) => {
    return batchService.batchDataCount(data);
  }
);

export const createNewBatch = createAsyncThunk(
  "batch/createNewBatch",
  async (data: IBatchRecord) => {
    return batchService.createNewBatch(data);
  }
);
export const editBatchById = createAsyncThunk(
  "batch/editBatchById",
  async (data: IBatchRecord) => {
    return batchService.editBatchById(data);
  }
);
export const removeBatchById = createAsyncThunk(
  "batch/removeBatchById",
  async (id: number) => {
    return batchService.removeBatchById(id);
  }
);

export const updateBatchStatus = createAsyncThunk(
  "batch/updateBatchStatus",
  async (data: IBatchStatus) => {
    return batchService.updateBatchStatus(data);
  }
);
