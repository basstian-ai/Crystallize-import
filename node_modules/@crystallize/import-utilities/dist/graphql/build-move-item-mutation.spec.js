"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_move_item_mutation_1 = require("./build-move-item-mutation");
(0, ava_1.default)('move item without position', (t) => {
    const got = (0, build_move_item_mutation_1.buildMoveItemMutation)('1234', { parentId: '5678' }).replace(/ /g, '');
    const want = `
    mutation {
      tree {
        moveNode (itemId: "1234", input: { parentId: "5678" }) {
          itemId
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('move item with position', (t) => {
    const got = (0, build_move_item_mutation_1.buildMoveItemMutation)('1234', {
        parentId: '5678',
        position: 0,
    }).replace(/ /g, '');
    const want = `
    mutation {
      tree {
        moveNode (itemId: "1234", input: { parentId: "5678", position: 0 }) {
          itemId
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
