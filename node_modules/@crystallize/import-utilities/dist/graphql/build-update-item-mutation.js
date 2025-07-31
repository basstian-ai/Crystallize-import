"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildUpdateItemQueryAndVariables = exports.buildUpdateItemMutation = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const json_to_graphql_query_1 = require("json-to-graphql-query");
const types_1 = require("../types");
const buildUpdateItemMutation = (id, input, type, language) => {
    const mutation = {
        mutation: {},
    };
    let components = undefined;
    if (input.components) {
        components = Object.keys(input.components).map((componentId) => {
            var _a;
            return (Object.assign(Object.assign({}, (_a = input.components) === null || _a === void 0 ? void 0 : _a[componentId]), { componentId }));
        });
    }
    mutation.mutation[type] = {
        update: {
            __args: {
                id,
                input: Object.assign(Object.assign({}, input), (components && { components })),
                language,
            },
            id: true,
            name: true,
            externalReference: true,
            tree: {
                path: true,
            },
        },
    };
    return (0, json_to_graphql_query_1.jsonToGraphQLQuery)(mutation);
};
exports.buildUpdateItemMutation = buildUpdateItemMutation;
function buildUpdateItemQueryAndVariables(id, input, type, language) {
    let inputType;
    let topFieldName;
    switch (type) {
        case types_1.ItemType.Document: {
            inputType = 'UpdateDocumentInput';
            topFieldName = 'document';
            break;
        }
        case types_1.ItemType.Folder: {
            inputType = 'UpdateFolderInput';
            topFieldName = 'folder';
            break;
        }
        case types_1.ItemType.Product: {
            inputType = 'UpdateProductInput';
            topFieldName = 'product';
            break;
        }
        default: {
            throw new Error(`Update item failed. Type "${type}" is not supported`);
        }
    }
    const variables = {
        id,
        language,
        input: Object.assign({}, input),
    };
    if (input.components) {
        const components = input.components;
        variables.input.components = Object.keys(components).map((componentId) => (Object.assign({ componentId }, components[componentId])));
    }
    return {
        query: (0, graphql_tag_1.default) `
      mutation UPDATE_ITEM ($id: ID!, $language: String!, $input: ${inputType}!) {
        ${topFieldName} {
          update (id: $id, language: $language, input: $input) {
            id
            externalReference
            tree {
              path
            }
          }
        }
      }
    `,
        variables,
    };
}
exports.buildUpdateItemQueryAndVariables = buildUpdateItemQueryAndVariables;
