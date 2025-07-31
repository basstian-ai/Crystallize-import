"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateGridMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateGridMutation = (input) => {
    const mutation = {
        mutation: {
            grid: {
                create: {
                    __args: input,
                    id: true,
                    name: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateGridMutation = buildCreateGridMutation;
