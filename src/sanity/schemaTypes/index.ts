import { type SchemaTypeDefinition } from "sanity";
import { product } from "./products";
import order from "./order";
import { categorySchema } from "./categories";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [product, order, categorySchema],
};
