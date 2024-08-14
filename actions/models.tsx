'use server';

import { gpt } from '@/config/env';

export const getModels = async (): Promise<string[]> => {
  return (await gpt().listModels()).split('\n');
};
