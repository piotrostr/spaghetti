export interface Recipe {
  description?: string;
  ingredients: Array<Ingredient>;
  // if the recipe allows multiple, like olive oil vs butter
  // map of ingredient ID to replacement ingredient ID
  replacements?: Map<ID, Ingredient>;
  instructions: Array<Instruction>;
}

export interface Ingredient {
  id: ID;
  name: string;
  quantity: string;
  unit: string;
}

export type Instruction = string;
export type ID = string;

export interface TrimmedProduct {
  id: string;
  sku: string;
  name: string;
  url: string;
  // TODO
  // price: number
}
