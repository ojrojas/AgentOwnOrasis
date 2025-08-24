export interface IGenerate {
  id:string;
  model: string;
  prompt: string;
  suffix?: string;
  system?: string;
  template?: string;
  context?: number[];
  raw?: boolean;
  format?: string | object;
  images?: Uint8Array[] | string[];
}
