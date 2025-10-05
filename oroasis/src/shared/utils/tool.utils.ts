export function parseToolCall(text: string): ToolCall | null {
    const tagMatch = text.match(/<([a-z_]+)[\s\S]*?>/i);
    if (!tagMatch) {
        return null;
    }

    const name = tagMatch[1];
    const innerMatch = text.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`, "i"));
    if (!innerMatch) {
        return { name, params: {} };
    }

    const inner = innerMatch[1];
    const params: Record<string, string> = {};
    const pairRe = /<([a-z_]+)>([\s\S]*?)<\/\1>/ig;

    let m;

    while ((m = pairRe.exec(inner)) !== null) {
        params[m[1]] = m[2].trim();
    }

    return { name, params };
}