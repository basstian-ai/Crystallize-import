"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateItemComponentMutation = exports.buildUpdateItemComponentQueryAndVariables = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const json_to_graphql_query_1 = require("json-to-graphql-query");
function buildUpdateItemComponentQueryAndVariables(variables) {
    return {
        query: (0, graphql_tag_1.default) `
      mutation UPDATE_ITEM_COMPONENT(
        $itemId: ID!
        $language: String!
        $input: ComponentInput!
      ) {
        item {
          updateComponent(itemId: $itemId, language: $language, input: $input) {
            id
          }
        }
      }
    `,
        variables,
    };
}
exports.buildUpdateItemComponentQueryAndVariables = buildUpdateItemComponentQueryAndVariables;
function buildUpdateItemComponentMutation(props) {
    const query = {
        mutation: {
            item: {
                updateComponent: {
                    __args: props,
                    id: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(query);
}
exports.buildUpdateItemComponentMutation = buildUpdateItemComponentMutation;
