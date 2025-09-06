export type IChatMessage = {
  id: string;
  messages: IMessage[];
  context?: number[];
  done?: boolean;
}

export type IMessage = {
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

export type IGenerateRequest = {
  model: string;
  prompt: string;
  template?: string;
  options?: Record<string, any>;
  context?: number[];
  system?: string;
  images?: (Uint8Array | string)[];
  keep_alive?: boolean;
  raw?: boolean;
  suffix?: string;
}

export type IChatRequest = {
  model: string;
  messages: IMessage[];
  options?: Record<string, any>;
  tools?: any[];
  format?: string;
  keep_alive?: boolean;
  stream?: boolean;
}

export type IGenerateMessage = IMessage;

export type IToolCall = {
  function: {
    name: string;
    arguments: {
      [key: string]: any;
    };
  };
}
