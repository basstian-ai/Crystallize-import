"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateShapeMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateShapeMutation = (input) => {
    const mutation = {
        mutation: {
            shape: {
                create: {
                    __args: {
                        input,
                    },
                    identifier: true,
                    name: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateShapeMutation = buildCreateShapeMutation;
