const apiUrl =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3002/api';

export const config = {
  /** e.g. http://localhost:3002/api */
  apiUrl,
  /** Masters API base (batches, etc.) */
  baseApiMasters: `${apiUrl.replace(/\/$/, '')}/masters`,
};
