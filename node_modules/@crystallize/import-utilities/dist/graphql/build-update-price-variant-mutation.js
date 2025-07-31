"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdatePriceVariantQueryAndVariables = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
function buildUpdatePriceVariantQueryAndVariables(variables) {
    return {
        query: (0, graphql_tag_1.default) `
      mutation UPDATE_PRICE_VARIANT(
        $identifier: String!
        $tenantId: ID!
        $input: UpdatePriceVariantInput!
      ) {
        priceVariant {
          update(identifier: $identifier, tenantId: $tenantId, input: $input) {
            identifier
          }
        }
      }
    `,
        variables,
    };
}
exports.buildUpdatePriceVariantQueryAndVariables = buildUpdatePriceVariantQueryAndVariables;
