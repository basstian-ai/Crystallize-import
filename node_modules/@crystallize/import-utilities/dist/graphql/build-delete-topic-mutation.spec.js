"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_delete_topic_mutation_1 = require("./build-delete-topic-mutation");
(0, ava_1.default)('delete mutation for topic', (t) => {
    const got = (0, build_delete_topic_mutation_1.buildDeleteTopicMutation)('1234').replace(/ /g, '');
    const want = `
    mutation {
      topic {
        delete(
          id: "1234"
        )
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
