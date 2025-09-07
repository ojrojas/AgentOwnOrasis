interface IModels {
  name: string;
  model: string;
  modified_at: Date;
  size: number,
}

export interface IListModelsResponse {
  data: IModels[];
}
