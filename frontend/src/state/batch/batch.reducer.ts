import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../app.model";
import {
  searchBatchData,
  createNewBatch,
  editBatchById,
  removeBatchById,
  updateBatchStatus,
} from "./batch.action";

import { IBatchState } from "./batch.model";

export const initialState: IBatchState = {
  batchData: {
    loading: false,
    hasErrors: false,
    message: "",
    data: {
      rows: [],
      meta: {
        take: 0,
        itemCount: 0,
        pageCount: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    },
  },
  createBatches: {
    loading: false,
    hasErrors: false,
    message: "",
  },
  editById: {
    loading: false,
    hasErrors: false,
    message: "",
  },
  removeById: {
    loading: false,
    hasErrors: false,
    message: "",
  },
  updateById: {
    loading: false,
    hasErrors: false,
    message: "",
  },
};

export const batchSlice = createSlice({
  name: "batch",
  initialState,
  reducers: {
    clearRemoveMessage: (state) => {
      state.removeById.message = "";
      state.updateById.message = "";
      state.editById.message = "";
      state.createBatches.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      // get batch
      .addCase(searchBatchData.pending, (state) => {
        state.batchData.loading = true;
      })
      .addCase(searchBatchData.fulfilled, (state, action: any) => {
        state.batchData.data = action.payload.data;
        state.batchData.message = action.payload.message;
        state.batchData.loading = false;
        state.batchData.hasErrors = false;
      })
      .addCase(searchBatchData.rejected, (state, action: any) => {
        state.batchData.loading = false;
        state.batchData.hasErrors = true;
        state.batchData.message = action.error.message;
      })

      // create batch
      .addCase(createNewBatch.pending, (state) => {
        state.createBatches.loading = true;
      })
      .addCase(createNewBatch.fulfilled, (state, action: any) => {
        state.createBatches.message = action.payload.message;
        state.createBatches.loading = false;
        state.createBatches.hasErrors = false;
      })
      .addCase(createNewBatch.rejected, (state, action: any) => {
        state.createBatches.loading = false;
        state.createBatches.hasErrors = true;
        state.createBatches.message = action.error.message;
      })

      // edit batch
      .addCase(editBatchById.pending, (state) => {
        state.editById.loading = true;
      })
      .addCase(editBatchById.fulfilled, (state, action: any) => {
        state.editById.message = action.payload.message;
        state.editById.loading = false;
        state.editById.hasErrors = false;
      })
      .addCase(editBatchById.rejected, (state, action: any) => {
        state.editById.loading = false;
        state.editById.hasErrors = true;
        state.editById.message = action.error.message;
      })

      // update batch status
      .addCase(updateBatchStatus.pending, (state) => {
        state.updateById.loading = true;
      })
      .addCase(updateBatchStatus.fulfilled, (state, action: any) => {
        state.updateById.message = action.payload.message;
        state.updateById.loading = false;
        state.updateById.hasErrors = false;
      })
      .addCase(updateBatchStatus.rejected, (state, action: any) => {
        state.updateById.loading = false;
        state.updateById.hasErrors = true;
        state.updateById.message = action.error.message;
      })

      // delete batch
      .addCase(removeBatchById.pending, (state) => {
        state.removeById.loading = true;
      })
      .addCase(removeBatchById.fulfilled, (state, action: any) => {
        state.removeById.loading = false;
        state.removeById.hasErrors = false;
        state.removeById.message = action.payload.message;
      })
      .addCase(removeBatchById.rejected, (state, action: any) => {
        state.removeById.loading = false;
        state.removeById.hasErrors = true;
        state.removeById.message = action.error.message;
      });
  },
});

// A selector
export const batchSelector = (state: RootState) => state.batch;

export const { clearRemoveMessage } = batchSlice.actions;

// The reducer
export default batchSlice.reducer;
