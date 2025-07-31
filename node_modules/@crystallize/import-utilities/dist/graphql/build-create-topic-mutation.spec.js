"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_create_topic_mutation_1 = require("./build-create-topic-mutation");
(0, ava_1.default)('create mutation for topic', (t) => {
    const input = {
        name: 'Cities',
        parentId: '',
        tenantId: '1234',
        children: [
            {
                name: 'Norway',
                children: [
                    {
                        name: 'Skien',
                    },
                    {
                        name: 'Porsgrunn',
                    },
                ],
            },
            {
                name: 'Portugal',
                children: [
                    {
                        name: 'Faro',
                    },
                    {
                        name: 'Olhão',
                    },
                ],
            },
        ],
    };
    const got = (0, build_create_topic_mutation_1.buildCreateTopicMutation)(input, 'en').replace(/ /g, '');
    const want = `
    mutation {
      topic {
        create(
          input: {
            name: "Cities",
            parentId: "",
            tenantId: "1234",
            children: [
              {
                name: "Norway",
                children: [{ name: "Skien" }, { name: "Porsgrunn" }]
              },
              { name: "Portugal", children: [{ name: "Faro" }, { name: "Olhão" }] }
            ]
          },
          language: "en"
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
