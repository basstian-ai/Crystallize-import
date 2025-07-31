"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildDeleteTopicMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildDeleteTopicMutation = (id) => {
    const mutation = {
        mutation: {
            topic: {
                delete: {
                    __args: {
                        id,
                    },
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildDeleteTopicMutation = buildDeleteTopicMutation;
