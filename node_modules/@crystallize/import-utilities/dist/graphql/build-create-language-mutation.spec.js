"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_create_language_mutation_1 = require("./build-create-language-mutation");
(0, ava_1.default)('create mutation for language', (t) => {
    const language = {
        tenantId: '1234',
        input: {
            code: 'en',
            name: 'English',
        },
    };
    const got = (0, build_create_language_mutation_1.buildCreateLanguageMutation)(language).replace(/ /g, '');
    const want = `
    mutation {
      language {
        add (
          tenantId: "1234",
          input: {
            code: "en",
            name: "English"
          }
        ) {
          code
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
