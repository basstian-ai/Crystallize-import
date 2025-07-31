"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateTenantMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateTenantMutation = (input) => {
    const mutation = {
        mutation: {
            tenant: {
                create: {
                    __args: {
                        input,
                    },
                    id: true,
                    identifier: true,
                    rootItemId: true,
                    shapes: {
                        identifier: true,
                        name: true,
                    },
                    defaults: {
                        language: true,
                        currency: true,
                    },
                    vatTypes: {
                        id: true,
                        name: true,
                    },
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateTenantMutation = buildCreateTenantMutation;
