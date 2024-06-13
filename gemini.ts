import {
  VertexAI,
  type GenerateContentResult,
  type GenerativeModel,
} from "@google-cloud/vertexai";
import { logger } from "./src/logger";
import { TrimmedProduct, type Recipe } from "./types";

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

  _parseText(response: GenerateContentResult): string {
    const text = response.response.candidates?.map(
      (c) => c.content.parts[0]
    )[0]["text"];
    logger.debug(text);
    if (!text) {
      throw new Error("Invalid response from model");
    }
    return text;
  }

  async makeRecipe(rawRecipe: string): Promise<Recipe> {
    const prompt = `
			jestem szefem kuchni. chce utworzyc szybkie przepisy z przeliczaniem
			jednostek. potrzebuje precyzyjnej informacji z podzialem na ilosc porcji i
			osob.

			Na podstawie przepisu, wygeneruj reprezentacje tego opisu w formacie JSON
			jesli podajesz informacje o winie zamień szklankę na kieliszek i przelicz
			jednostki.

			przeliczaj według poniższych zasad:

			kieliszek mocnego alkoholu ≈ 0,045 – 0,05 litra 
			Kieliszek wina ≈ 0,1 - 0,125 litra
			filiżanka ≈ 240 cm³[1] lub 250 cm³[a][2] (ang. cup)
			łyżka stołowa ≈ 15 cm³[1] (z wyjątkiem Australii, gdzie jest to ok. 20
			cm³[3])
			łyżeczka ≈ 5 cm³
			szczypta ≈ 1/4 – 1/2 grama
			kilka gałązek ≈ doniczka
			jesli podajesz informacje o alkoholu mocnym zamień szklankę na kieliszek i
			przelicz odpowiednio jednostki.

			Oto przepis ze strony:
			${rawRecipe}

      Odpowiedz podaj w formacie JSON zgodnym z poniższym schematem:

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
			
			zwracaj tylko JSON, aby można go było natychmiast przetworzyć na obiekt,
			odpowiedz powinna zawierac tylko poprawny ciąg JSON
			`;
    logger.debug(prompt);
    const response = await this.model.generateContent(prompt);
    logger.debug(`makeRecipe response: ${JSON.stringify(response)}`);
    // TODO hacky, should use a JSON validator and handle errors if model
    // does not return a valid response, should not be hard-indexing
    const text = this._parseText(response);
    return JSON.parse(text.replace("```json", "").replace("```", "")) as Recipe;
  }

  async makeShoppingList(
    recipe: Recipe,
    topProducts: Array<Array<TrimmedProduct>>
    // userContext: string TODO czy uzytkownik jest wege, czy ma alergeny itd
  ): Promise<string> /* Promise<Array<TrimmedProduct>> */ {
    // TODO fix: this blocks stuff to safety reasons
    const response = await this.model.generateContent(`
		Na podstawie ponizszego przepisu i listy produktow, wybierz najbardziej
		pasujace produkty dla kazdego skladnika

		Lista ma format listy list, gdzie kolejno dla kazdego skladnika sa wyniki
		wyszukiwan dla tego produktu

		Twoja finalna lista powinna miec format:
		[{
			id: 'id produktu',
			sku: 'sku produktu',
			name: 'nazwa produktu',
			url: 'url produktu',
		}]
		tak samo jak wejsciowa lista list

		Oto lista produktow z przepisu:
		${JSON.stringify(recipe.ingredients)}

		I tutaj lista produktow z wynikow wyszukiwania:
		${JSON.stringify(topProducts)}
		`);
    // TODO hacky, should use a JSON validator and handle errors if model
    // does not return a valid response, should not be hard-indexing
    const text = this._parseText(response);
    return text;
  }
}
