export interface IModels {
  name: string;
  model: string;
  modified_at: Date;
  size: number;
  digest: string;
}

export interface IListModelsResponse {
  models: IModels[];
}

export type IModelInfo = {
  model_info: {
    ctx_context: number;
  };
  capabilities: string[];
}
