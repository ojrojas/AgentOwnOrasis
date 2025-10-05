export type SchemaProperty =
    | {
        type: string;
        description?: string;
        enum?: string[];
    }
    | {
        type: number | boolean | object | Array<any>;
        description?: string;
        properties?: Record<string, SchemaProperty>;
    };

export interface ToolFunction {
    type: Function;
    function: {
        name: string;
        description?: string;
        parameters: {
            type: object;
            properties: Record<string, SchemaProperty>;
            required?: string[];
        };
    };
}
