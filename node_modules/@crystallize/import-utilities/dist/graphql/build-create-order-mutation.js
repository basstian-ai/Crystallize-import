"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateOrderMutation = void 0;
const graphql_tag_1 = require("graphql-tag");
function buildCreateOrderMutation(input) {
    return {
        query: (0, graphql_tag_1.gql) `
      mutation CREATE_ORDER($input: CreateOrderInput!) {
        orders {
          create(input: $input) {
            id
          }
        }
      }
    `,
        variables: { input },
    };
}
exports.buildCreateOrderMutation = buildCreateOrderMutation;
