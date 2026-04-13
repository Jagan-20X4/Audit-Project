import request from "src/lib/axios/request";
import { IBatchRecord } from "src/pages/Batch/batches.model";
import { config } from "src/utils";
import { IApiResponse } from "src/utils/models/common";
import { IBatch, IBatchDetails, IBatchStatus } from "./batch.model";

export interface IBatchStatusCounts {
  active: number;
  inactive: number;
}

class BatchService {
  ENDPOINT = config.baseApiMasters + "/batches";

  public searchBatchData = async (
    data: Record<string, unknown>,
  ): Promise<IApiResponse<IBatchDetails>> => {
    const url = `${this.ENDPOINT}`;
    const res = await request<IApiResponse<IBatchDetails>>({
      url,
      method: "GET",
      params: data,
    });
    return res.data;
  };

  public batchDataCount = async (
    _data: Record<string, unknown>,
  ): Promise<IApiResponse<IBatchStatusCounts>> => {
    const url = `${this.ENDPOINT}/status-counting`;
    const res = await request<IApiResponse<IBatchStatusCounts>>({
      url,
      method: "GET",
      params: _data,
    });
    return res.data;
  };

  public createNewBatch = async (
    data: IBatchRecord,
  ): Promise<IApiResponse<IBatch>> => {
    const url = `${this.ENDPOINT}`;
    const res = await request<IApiResponse<IBatch>>({
      url,
      method: "POST",
      data,
    });
    return res.data;
  };

  public editBatchById = async (
    data: IBatchRecord,
  ): Promise<IApiResponse<IBatch>> => {
    const url = `${this.ENDPOINT}/${data.id}`;
    const res = await request<IApiResponse<IBatch>>({
      url,
      method: "PUT",
      data,
    });
    return res.data;
  };

  public removeBatchById = async (
    id: number,
  ): Promise<IApiResponse<IBatch | null>> => {
    const url = `${this.ENDPOINT}/${id}`;
    const res = await request<IApiResponse<IBatch | null>>({
      url,
      method: "DELETE",
    });
    return res.data;
  };

  public updateBatchStatus = async (
    data: IBatchStatus,
  ): Promise<IApiResponse<IBatch>> => {
    const url = `${this.ENDPOINT}/status/${data.id}`;
    const res = await request<IApiResponse<IBatch>>({
      url,
      method: "PATCH",
      data,
    });
    return res.data;
  };
}

const batchService = new BatchService();
export default batchService;
