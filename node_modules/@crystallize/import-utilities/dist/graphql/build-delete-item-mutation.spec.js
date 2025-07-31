"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const types_1 = require("../types");
const build_delete_item_mutation_1 = require("./build-delete-item-mutation");
(0, ava_1.default)('delete mutation for product', (t) => {
    const got = (0, build_delete_item_mutation_1.buildDeleteItemMutation)('1234', types_1.ItemType.Product).replace(/ /g, '');
    const want = `
    mutation {
      product {
        delete (id: "1234")
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('delete mutation for document', (t) => {
    const got = (0, build_delete_item_mutation_1.buildDeleteItemMutation)('1234', types_1.ItemType.Document).replace(/ /g, '');
    const want = `
    mutation {
      document {
        delete (id: "1234")
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('delete mutation for folder', (t) => {
    const got = (0, build_delete_item_mutation_1.buildDeleteItemMutation)('1234', types_1.ItemType.Folder).replace(/ /g, '');
    const want = `
    mutation {
      folder {
        delete (id: "1234")
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
