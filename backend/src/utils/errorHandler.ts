import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const status = error.response.status;
    const data = error.response.data;
    const message = typeof data === 'object' && data?.message ? data.message : JSON.stringify(data);
    return `HTTP ${status}: ${message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export function logError(error: unknown, context: string): void {
  console.error(`❌ Error: ${context}`);

  if (isAxiosError(error) && error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Response data:`, JSON.stringify(error.response.data, null, 2));
    if (error.config?.url) {
      console.error(`Request URL: ${error.config.url}`);
    }
  } else if (error instanceof Error) {
    console.error(error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(String(error));
  }
}

export function handleApiError(error: unknown, context: string): string {
  logError(error, context);
  return getErrorMessage(error);
}
