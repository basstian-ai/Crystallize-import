"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateShapeMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildUpdateShapeMutation = (input) => {
    const mutation = {
        mutation: {
            shape: {
                update: {
                    __args: input,
                    identifier: true,
                    name: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildUpdateShapeMutation = buildUpdateShapeMutation;
