"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_update_item_component_mutation_1 = require("./build-update-item-component-mutation");
(0, ava_1.default)('update mutation for boolean', (t) => {
    const args = {
        itemId: '1234',
        language: 'en',
        input: {
            componentId: 'my-boolean-component',
            boolean: {
                value: true,
            },
        },
    };
    const got = (0, build_update_item_component_mutation_1.buildUpdateItemComponentMutation)(args).replace(/ /g, '');
    const want = `
    mutation {
      item {
        updateComponent (
          itemId: "1234",
          language: "en",
          input: {
            componentId: "my-boolean-component",
            boolean: {
              value: true
            }
          }
        ) {
          id
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
