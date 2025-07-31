"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_create_vat_type_mutation_1 = require("./build-create-vat-type-mutation");
(0, ava_1.default)('create mutation for vat type', (t) => {
    const vatType = {
        input: {
            tenantId: '1234',
            name: 'Regular',
            percent: 25,
        },
    };
    const got = (0, build_create_vat_type_mutation_1.buildCreateVatTypeMutation)(vatType).replace(/ /g, '');
    const want = `
    mutation {
      vatType {
        create (
          input: {
            tenantId: "1234",
            name: "Regular",
            percent: 25
          }
        ) {
          name
          percent
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
