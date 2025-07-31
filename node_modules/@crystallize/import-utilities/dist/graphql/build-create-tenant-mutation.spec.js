"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const shape_input_1 = require("../types/shapes/shape.input");
const build_create_tenant_mutation_1 = require("./build-create-tenant-mutation");
(0, ava_1.default)('create mutation for basic tenant', (t) => {
    const input = {
        identifier: 'cool-shop',
        name: 'Cool Shop',
    };
    const got = (0, build_create_tenant_mutation_1.buildCreateTenantMutation)(input).replace(/ /g, '');
    const want = `
    mutation {
      tenant {
        create(
          input: {
            identifier: "cool-shop",
            name: "Cool Shop"
          }
        ) {
          id
          identifier
          rootItemId
          shapes {
            identifier
            name
          }
          defaults {
            language
            currency
          }
          vatTypes {
            id
            name
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('create mutation for tenant with shapes', (t) => {
    const input = {
        identifier: 'cool-shop',
        name: 'Cool Shop',
        shapes: [
            {
                identifier: 'cool-product',
                name: 'Cool Product',
                type: shape_input_1.shapeTypes.product,
            },
            {
                identifier: 'less-cool-product',
                name: 'Less Cool Product',
                type: shape_input_1.shapeTypes.product,
            },
        ],
        defaults: {
            language: 'no',
            currency: 'NOK',
        },
    };
    const got = (0, build_create_tenant_mutation_1.buildCreateTenantMutation)(input).replace(/ /g, '');
    const want = `
    mutation {
      tenant {
        create(
          input: {
            identifier: "cool-shop",
            name: "Cool Shop",
            shapes: [
              {
                identifier: "cool-product",
                name: "Cool Product",
                type: product
              },
              {
                identifier: "less-cool-product",
                name: "Less Cool Product",
                type: product
              }
            ],
            defaults: {
              language: "no",
              currency: "NOK"
            }
          }
        ) {
          id
          identifier
          rootItemId
          shapes {
            identifier
            name
          }
          defaults {
            language
            currency
          }
          vatTypes {
            id
            name
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
