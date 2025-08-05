export interface IMessage {
  id: string;
  role: string;
  content: string;
  images?: Uint8Array[] | string[];
  tool_calls?: IToolCall[];
  timestamp: Date;
  model: string;
}

export interface IToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}
