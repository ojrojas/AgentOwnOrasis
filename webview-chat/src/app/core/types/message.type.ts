export interface IMessage {
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
  tool_calls?: IToolCall[];
}

export interface IToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}
