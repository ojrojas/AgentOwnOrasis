 export async function* asAsyncGenerator<T>(value: Promise<T> | AsyncGenerator<T>) {
        if (Symbol.asyncIterator in value) {
            yield* value as AsyncGenerator<T>;
        } else {
            yield await value as T;
        }
    }