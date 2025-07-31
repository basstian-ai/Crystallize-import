"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateGridMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildUpdateGridMutation = (input) => {
    const mutation = {
        mutation: {
            grid: {
                update: {
                    __args: input,
                    id: true,
                    name: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildUpdateGridMutation = buildUpdateGridMutation;
