import * as v from 'valibot';

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
