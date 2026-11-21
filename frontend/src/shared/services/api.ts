import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

export interface ApiErrorResult {
  message: string;
  fieldErrors: Record<string, string>;
}

export function extractApiError(error: unknown): ApiErrorResult {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; fieldErrors?: Record<string, string> }
      | undefined;

    return {
      message:
        data?.message ||
        'Não foi possível completar a operação. Verifique a conexão com o servidor.',
      fieldErrors: data?.fieldErrors ?? {},
    };
  }

  return {
    message: 'Ocorreu um erro inesperado.',
    fieldErrors: {},
  };
}

export function getImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
}

