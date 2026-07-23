export class RequestTimeoutError extends Error {
  constructor(message = "This request took too long. Please try again.") {
    super(message);
    this.name = "RequestTimeoutError";
  }
}

export async function withTimeout<T>(
  task: PromiseLike<T>,
  timeoutMs = 10_000,
  message?: string,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      Promise.resolve(task),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new RequestTimeoutError(message)), timeoutMs);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
