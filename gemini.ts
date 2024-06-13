import { VertexAI, type GenerativeModel } from "@google-cloud/vertexai";
import { type Recipe } from "./types";

export class Gemini {
  private model: GenerativeModel;

  constructor(project: string, location: string) {
    const vertexAI = new VertexAI({
      project,
      location,
    });
    this.model = vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });
  }

  async makeRecipe(prompt: string): Promise<Recipe> {
    const response = await this.model.generateContent(
      prompt +
        "\n" +
        ` the response should be in JSON format, matching the following interface:
		 export interface Recipe {
			description?: string;
			ingredients: Array<Ingredient>;
			instructions: Array<Instruction>;
		}
		
		export interface Ingredient {
			name: string;
			quantity: string;
			unit: string;
		}
		
		export type Instruction = string;
		export type ID = string;

		return only the JSON so it can be instantly parsed into an object
		 `
    );
    // TODO hacky, should use a JSON validator and handle errors if model
    // does not return a valid response, should not be hard-indexing
    const text = response.response.candidates?.map(
      (c) => c.content.parts[0]
    )[0]["text"];
    if (!text) {
      throw new Error("Invalid response from model");
    }
    return JSON.parse(text) as Recipe;
  }
}
