"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateVatTypeMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateVatTypeMutation = (input) => {
    const mutation = {
        mutation: {
            vatType: {
                create: {
                    __args: input,
                    name: true,
                    percent: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateVatTypeMutation = buildCreateVatTypeMutation;
