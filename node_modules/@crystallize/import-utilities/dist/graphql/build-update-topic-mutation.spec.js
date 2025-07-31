"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_update_topic_mutation_1 = require("./build-update-topic-mutation");
(0, ava_1.default)('update mutation for topic', (t) => {
    const topic = {
        id: 'some-id',
        language: 'en',
        input: {
            name: 'new topic name',
            parentId: '1234'
        },
    };
    const got = (0, build_update_topic_mutation_1.buildUpdateTopicMutation)(topic).replace(/ /g, '');
    const want = `
    mutation {
      topic {
        update (
          id: "some-id",
          language: "en",
          input: {
            name: "new topic name",
            parentId: "1234"
          }
        ) {
          id
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
