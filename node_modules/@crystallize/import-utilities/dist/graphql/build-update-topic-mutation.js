"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateTopicMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildUpdateTopicMutation = (args, queryFields = {
    id: true,
    name: true
}) => {
    const mutation = {
        mutation: {
            topic: {
                update: Object.assign({ __args: args }, queryFields),
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildUpdateTopicMutation = buildUpdateTopicMutation;
