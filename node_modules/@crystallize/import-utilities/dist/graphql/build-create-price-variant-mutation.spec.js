"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_create_price_variant_mutation_1 = require("./build-create-price-variant-mutation");
(0, ava_1.default)('create mutation for price variant', (t) => {
    const priceVariant = {
        identifier: 'europe',
        name: 'Europe',
        tenantId: '1234',
        currency: 'EUR',
    };
    const got = (0, build_create_price_variant_mutation_1.buildCreatePriceVariantMutation)(priceVariant).replace(/ /g, '');
    const want = `
    mutation {
      priceVariant {
        create (
          input: {
            identifier: "europe",
            name: "Europe",
            tenantId: "1234",
            currency: "EUR"
          }
        ) {
          identifier
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
