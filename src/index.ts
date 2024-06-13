import { Gemini } from "../gemini";
import { searchProduct } from "./search";

(async () => {
  try {
    const result = await searchProduct("banan", 1, 0);
    const gemini = new Gemini("vertex-ai-playground-402513", "europe-central2");
    const recipe = await gemini.makeRecipe("I want to make a banana cake");
    console.log(recipe);
    console.log(result["data"]["productSearch"]["results"]);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})();
