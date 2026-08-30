import { vi } from "vitest";

export function createTestLogger(): Logger {
  const logger = {
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    trace: vi.fn(),
    child: vi.fn(),
  };

  logger.child.mockReturnValue(logger);
  return logger as unknown as Logger;
}

