"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateStockLocationMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateStockLocationMutation = (input) => {
    const mutation = {
        mutation: {
            stockLocation: {
                create: {
                    __args: {
                        input: input,
                    },
                    identifier: true,
                    name: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateStockLocationMutation = buildCreateStockLocationMutation;
