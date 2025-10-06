import { Rol } from "../enums/rol.enum";

export interface IMessage {
  id: string;
  role: Rol.user | Rol.assistant | Rol.system;
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

