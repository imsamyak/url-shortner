import { ConfigurationError } from "@app/error";
import { z } from "zod";

/** Lazily reads, validates, and caches one environment value or related group. */
export class LoadEnv<T> {
  private resolved = false;
  private value!: T;

  private constructor(
    private readonly label: string,
    private readonly schema: z.ZodTypeAny,
    private readonly read: () => unknown,
  ) { }

  public static of<S extends z.ZodTypeAny>(key: string, schema: S) {
    return new LoadEnv<z.infer<S>>(key, schema, () => process.env[key]);
  }

  public static group<S extends z.ZodTypeAny>(
    label: string,
    schema: S,
    read: () => unknown,
  ) {
    return new LoadEnv<z.infer<S>>(label, schema, read);
  }

  public get(): T {
    if (this.resolved) return this.value;

    const result = this.schema.safeParse(this.read());
    if (!result.success) {
      const issues = result.error.errors.map((issue) => issue.message).join(", ");
      throw new ConfigurationError({
        message: `Environment validation failed for ${this.label}: ${issues}`,
        options: { cause: result.error },
      });
    }

    this.value = result.data;
    this.resolved = true;
    return this.value;
  }

  public getter(): () => T {
    return () => this.get();
  }
}

export default LoadEnv;
