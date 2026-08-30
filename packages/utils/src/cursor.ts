
export function encodeCursor(key?: Record<string, any>): string | undefined {
    if (!key) {
        return undefined;
    }

    return Buffer.from(JSON.stringify(key), "utf8").toString("base64url");
}

export function decodeCursor(cursor?: string): Record<string, any> | undefined {
    if (!cursor) {
        return undefined;
    }

    try {
        const value: unknown = JSON.parse(
            Buffer.from(cursor, "base64url").toString("utf8"),
        );

        if (!value || Array.isArray(value) || typeof value !== "object") {
            throw new TypeError("Cursor payload must be an object");
        }

        return value as Record<string, any>;
    } catch (cause) {
        throw new TypeError("Invalid cursor", { cause });
    }
}
