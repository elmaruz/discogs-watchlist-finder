import * as v from 'valibot'

/**
 * Validates data against a Valibot schema and returns the parsed result.
 * Throws an error with detailed validation issues if parsing fails.
 *
 * @param schema - The Valibot schema to validate against
 * @param data - The data to validate
 * @param context - Optional context string for error messages (e.g., "User profile for 'john'")
 * @returns The validated and typed data
 * @throws Error if validation fails
 */
export function validate<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
  schema: TSchema,
  data: unknown,
  context?: string
): v.InferOutput<TSchema> {
  const result = v.safeParse(schema, data)

  if (!result.success) {
    const errorContext = context ? `: ${context}` : ''
    console.error(`❌ Validation Error${errorContext}`)
    console.error('Parse errors:', v.flatten(result.issues))
    throw new Error(`Failed to parse data${errorContext}`)
  }

  return result.output
}
