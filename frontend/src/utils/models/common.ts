export interface IApiResponse<T> {
  data: T;
  message: string;
  error: boolean;
}
