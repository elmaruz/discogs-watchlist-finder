import * as v from 'valibot';
import type { Response } from 'express';

export function validate<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(schema: TSchema, data: unknown, context?: string): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, data);

  if (!result.success) {
    const errorContext = context ? `: ${context}` : '';
    console.error(`❌ Validation Error${errorContext}`);
    console.error('Parse errors:', v.flatten(result.issues));
    throw new Error(`Failed to parse data${errorContext}`);
  }

  return result.output;
}

export function parseBody<
  TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
>(
  schema: TSchema,
  body: unknown,
  res: Response
): v.InferOutput<TSchema> | null {
  const result = v.safeParse(schema, body);

  if (!result.success) {
    const message = result.issues.map((i) => i.message).join(', ');
    res.status(400).json({ error: message });
    return null;
  }

  return result.output;
}
