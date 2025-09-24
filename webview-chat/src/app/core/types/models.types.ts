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
  capabilities: string[];
  model_info: {
    ctx_number: number;
  };
}
