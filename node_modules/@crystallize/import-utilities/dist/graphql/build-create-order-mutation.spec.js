"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const build_create_order_mutation_1 = require("./build-create-order-mutation");
(0, ava_1.default)('create order', (t) => {
    const input = {
        customer: {
            identifier: 'my-identifier',
            firstName: 'Harry',
            middleName: 'The',
            lastName: 'Wizard',
            companyName: 'Magic & Co',
            taxNumber: '1234',
            addresses: [
                {
                    email: 'foo@example.com',
                    phone: '123456789',
                    type: 'billing',
                    streetNumber: '1',
                    street: 'Developer',
                    street2: 'Way',
                    city: 'Oslo',
                    state: 'Oslo',
                    country: 'Norway',
                    postalCode: '1234',
                },
            ],
        },
        cart: [
            {
                name: 'Product 1',
                productId: 'some-product-id',
                productVariantId: 'some-product-variant-id',
                sku: 'some-sku',
                price: {
                    currency: 'NZD',
                    gross: 123,
                    net: 234,
                    tax: {
                        name: 'GST',
                        percent: 15,
                    },
                },
            },
        ],
        total: 234,
    };
    const got = (0, build_create_order_mutation_1.buildCreateOrderMutation)(input);
    const want = {
        query: (0, graphql_tag_1.default) `
      mutation CREATE_ORDER($input: CreateOrderInput!) {
        orders {
          create(input: $input) {
            id
          }
        }
      }
    `,
        variables: {
            input,
        },
    };
    t.deepEqual(got, want, 'mutation and variables should match');
});
