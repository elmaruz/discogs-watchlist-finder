import { isAxiosError } from 'axios';

export function handleApiError(
  error: unknown,
  context: string,
  options: { throwOnNon404?: boolean } = {}
): void {
  console.log(error);

  const { throwOnNon404 = false } = options;

  if (isAxiosError(error) && error.response?.status === 404) {
    console.log(`⚠️  ${context} - not found, skipping`);
    return;
  }

  console.error(`❌ Error: ${context}`);
  if (isAxiosError(error) && error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(
      `Response data:`,
      JSON.stringify(error.response.data, null, 2)
    );
    if (error.config?.url) {
      console.error(`Request URL: ${error.config.url}`);
    }
    if (error.config?.params) {
      console.error(`Request params:`, error.config.params);
    }
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }

  if (throwOnNon404) {
    throw error;
  }
}
