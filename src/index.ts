import { Gemini } from "../gemini";
import { TrimmedProduct } from "../types";
import { searchProduct } from "./search";

// TODOs
// * it might be a good idea to narrow down categories to food not to get cleaning
// products n stuff
// * it might make sense to ignore salt, pepper, sugar, water, etc. as they are
// usually present in every recipe and available in virtually every household
(async () => {
  try {
    const gemini = new Gemini("vertex-ai-playground-402513", "europe-central2");
    const rawRecipe = `
    SKŁADNIKI
    1 - 2 PORCJE
    2 pomidory
    1/2 łyżki masła lub oliwy
    1/2 ząbka czosnku
    przyprawy: sól i świeżo zmielony pieprz, szczypta oregano oraz opcjonalnie chili i kminu rzysmkiego
    2 jajka
    do podania: świeża bazylia, bagietka

    PRZYGOTOWANIE
    Przygotować pomidory: sparzyć, obrać ze skórki, pokroić na ćwiartki, wykroić
    szypułki, miąższ pokroić w kosteczkę.  Na niedużą patelnię (około 20 cm
    średnicy) włożyć masło lub wlać oliwę oraz starty czosnek, chwilę podsmażyć.
    Pomidory włożyć na patelnię, doprawić solą, pieprzem i przyprawami. Wymieszać
    i intensywnie smażyć na większym ogniu przez około 4 minuty, już bez
    mieszania (wówczas pomidory odparują i zachowają swoją strukturę, jeśli
    będziemy mieszać zrobi się przecier).  Do podsmażonych pomidorów wbić jajka,
    doprawić solą. Przykryć i gotować przez około 3 minuty lub do czasu aż białka
    jajek będą ścięte. Podawać ze świeżą bazylią i bagietką.      
    `;
    const recipe = await gemini.makeRecipe(rawRecipe);

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
          // price: r["price"].value,
        }))
    );
    console.log(recipe);
    console.log(postprocessedResults);

    await gemini.makeShoppingList(recipe, postprocessedResults);
  } catch (error) {
    console.error("Error", error);
  }
})();
