"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateCustomerMutation = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
function buildCreateCustomerMutation(input) {
    return {
        query: (0, graphql_tag_1.default) `
      mutation CREATE_CUSTOMER($input: CreateCustomerInput!) {
        customer {
          create(input: $input) {
            identifier
          }
        }
      }
    `,
        variables: { input },
    };
}
exports.buildCreateCustomerMutation = buildCreateCustomerMutation;
