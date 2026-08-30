import { encodeCursor } from "./cursor";

export interface PaginatedInput {
    Items?: Record<string, any>[] | any[];
    LastEvaluatedKey?: Record<string, any>;
}

export const toPaginated = <T>(output: PaginatedInput) => {
    const items = (output.Items ?? []) as T[];
    const cursor = output.LastEvaluatedKey
        ? encodeCursor(output.LastEvaluatedKey)
        : undefined;
    return { items, cursor };
};