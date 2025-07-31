"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const build_create_customer_mutation_1 = require("./build-create-customer-mutation");
(0, ava_1.default)('create customer', (t) => {
    const input = {
        tenantId: '1234',
        identifier: 'my-identifier',
        firstName: 'Harry',
        middleName: 'The',
        lastName: 'Wizard',
        companyName: 'Magic & Co',
        taxNumber: '1234',
        email: 'foo@example.com',
        phone: '123456789',
        addresses: [
            {
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
    };
    const got = (0, build_create_customer_mutation_1.buildCreateCustomerMutation)(input);
    const want = {
        query: (0, graphql_tag_1.default) `
      mutation CREATE_CUSTOMER($input: CreateCustomerInput!) {
        customer {
          create(input: $input) {
            identifier
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
