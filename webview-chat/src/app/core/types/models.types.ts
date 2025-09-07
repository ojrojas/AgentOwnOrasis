interface IModels {
  created: Date,
  id: string;
  object: string;
  owned_by: string;
}

export interface IListModelsResponse {
  data: IModels[];
}
