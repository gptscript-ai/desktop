'use server';

import { gpt } from '@/config/env';
import { Arguments } from '@gptscript-ai/gptscript';

export async function summarizeConfirmPrompt(
  prompt: string,
  command: string | undefined,
  args: Arguments
): Promise<string> {
  let instructions = `Rewrite the following question for the user.
  Hide any technical details, but still include things like file names, paths, IDs, and arguments.
  If there are arguments, include them, but not as a JSON string. If there are no arguments, do not mention arguments.

  Question:

  ${prompt}`;
  if (command) {
    instructions += `\n${command}`;
  }
  switch (typeof args) {
    case 'string':
      instructions += `\nArguments: ${args}`;
      break;
    case 'object':
      instructions += `\nArguments: ${JSON.stringify(args, null, 2)}`;
      break;
  }

  const summary = await gpt().evaluate({ instructions });
  return summary.text();
}
