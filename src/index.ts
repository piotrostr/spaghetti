import { Gemini } from "../gemini";
import { tiramisu } from "../recipies";
import { TrimmedProduct } from "../types";
import { logger } from "./logger";
import { searchProduct } from "./search";

// TODOs
// * it might be a good idea to narrow down categories to food not to get cleaning
// products n stuff
// * it might make sense to ignore salt, pepper, sugar, water, etc. as they are
// usually present in every recipe and available in virtually every household
(async () => {
  try {
    const gemini = new Gemini("vertex-ai-playground-402513", "europe-central2");
    const recipe = await gemini.makeRecipe(tiramisu);

    const productResultsPromises = recipe.ingredients.map((ingredient) =>
      searchProduct(ingredient.name, 5, 0)
    );

    const results = await Promise.all(productResultsPromises);
    const postprocessedResults: Array<Array<TrimmedProduct>> = results.map(
      (result) =>
        result["data"]["productSearch"]["results"].map((r) => ({
          id: r["id"],
          sku: r["sku"],
          name: r["name"],
          url: "https://delio.com.pl/products/" + r["slug"],
          description: r["description"],
          // price: r["price"].value,
        }))
    );
    logger.info(recipe);
    logger.info(postprocessedResults);

    const endRes = await gemini.makeShoppingList(recipe, postprocessedResults);
    logger.info(endRes);
  } catch (error) {
    logger.error("Error", error);
  }
})();
