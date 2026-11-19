import { create as createHttpClient, type AxiosError } from 'axios';

import type { ApiErrorBody } from '@/types/anime';
import { getApiBaseUrl, getApiKey } from './config';

export class ApiClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

export const client = createHttpClient({
  timeout: 30000,
});

client.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  config.headers.set('X-API-Key', getApiKey());
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new ApiClientError('El servidor de anime tardó demasiado en responder. Intenta de nuevo.')
      );
    }

    if (!error.response) {
      return Promise.reject(
        new ApiClientError('Sin conexión. Revisa tu red e inténtalo de nuevo.')
      );
    }

    const body = error.response.data;
    const message =
      body && typeof body === 'object' && 'message' in body && body.message
        ? String(body.message)
        : `Error ${error.response.status} del servidor de anime.`;

    return Promise.reject(new ApiClientError(message, error.response.status));
  }
);
