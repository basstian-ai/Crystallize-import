"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildMoveItemMutation = void 0;
const json_to_graphql_query_1 = require("json-to-graphql-query");
const buildMoveItemMutation = (itemId, input) => {
    const mutation = {
        mutation: {
            tree: {
                moveNode: {
                    __args: {
                        itemId,
                        input,
                    },
                    itemId: true,
                },
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildMoveItemMutation = buildMoveItemMutation;
