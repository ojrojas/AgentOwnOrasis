export class StringBuilder {
    private parts: string[] = [];
    private _length = 0;

    constructor(initial?: string) {
        if (initial) {
            this.append(initial);
        }
    }

    get length(): number {
        return this._length;
    }

    get isEmpty(): boolean {
        return this._length === 0;
    }

    append(...values: Array<string | number | boolean | null | undefined>): this {
        for (const v of values) {
            const s = v === null ? "" : String(v);

            if (s.length === 0) {
                continue;
            }

            this.parts.push(s);
            this._length += s.length;
        }
        return this;
    }

    appendLine(value: string = ""): this {
        const s = value + "\n";
        this.append(s);
        return this;
    }

    replace(searchValue: string | RegExp, replaceValue: string): this {
        const whole = this.toString();
        const replaced = whole.replace(searchValue as any, replaceValue);
        this.parts = [replaced];
        this._length = replaced.length;
        return this;
    }

    clear(): this {
        this.parts = [];
        this._length = 0;
        return this;
    }

    toValueString(): string {
        if (this.parts.length <= 1) {
            return this.parts[0] ?? "";
        }

        const joined = this.parts.join("");
        this.parts = [joined];
        const stringJoined = joined;
        this.clear();
        return stringJoined;
    }
}
