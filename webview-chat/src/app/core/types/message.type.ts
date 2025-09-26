export interface IMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  images?: Uint8Array<ArrayBufferLike>[] | string[];
  tool_calls?: IToolCall[];
  timestamp: Date;
  model: string;
  done?: boolean;
  context?: number[];
  type?: string;
  files?: string[];
  chatId?: string;
}

export interface IToolCall {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}

