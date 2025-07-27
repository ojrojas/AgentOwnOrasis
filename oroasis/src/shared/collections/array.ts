export function findLastIndex<T>(array: Array<T>, predicate: (value: T, index: number, obj: T[]) => boolean): number {
    let count = array.length;
    while (count--) {
        if (predicate(array[count], count, array)) {
            return count;
        }
    }
    return -1;
}

export function findLast<T>(array: Array<T>, predicate: (value: T, index: number, obt: T[]) => boolean): T | undefined {
    const index = findLastIndex(array, predicate);
    return index === -1 ? undefined : array[index];
}