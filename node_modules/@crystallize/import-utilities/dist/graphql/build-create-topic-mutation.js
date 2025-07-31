"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateTopicMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildCreateTopicMutation = (input, language, queryFields = {
    id: true,
    name: true,
}) => {
    const mutation = {
        mutation: {
            topic: {
                create: Object.assign({ __args: {
                        input,
                        language,
                    } }, queryFields),
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildCreateTopicMutation = buildCreateTopicMutation;
