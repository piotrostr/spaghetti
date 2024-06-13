import { searchProduct } from "./search";

(async () => {
  try {
    const result = await searchProduct("banan", 1, 0);

    console.log(result);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
})();
