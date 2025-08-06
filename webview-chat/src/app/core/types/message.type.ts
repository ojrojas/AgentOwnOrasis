export interface IMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: Uint8Array[] | string[];
  tool_calls?: IToolCall[];
  timestamp: Date;
  model: string;
  done?: boolean;
}

export interface IToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}
