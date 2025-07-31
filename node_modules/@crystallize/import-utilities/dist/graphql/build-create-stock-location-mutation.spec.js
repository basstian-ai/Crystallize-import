"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_create_stock_location_mutation_1 = require("./build-create-stock-location-mutation");
(0, ava_1.default)('create mutation for price variant', (t) => {
    const stockLocation = {
        identifier: 'europe-warehouse',
        name: 'Europe Warehouse',
        tenantId: '1234',
        settings: {
            minimum: 0,
        },
    };
    const got = (0, build_create_stock_location_mutation_1.buildCreateStockLocationMutation)(stockLocation).replace(/ /g, '');
    const want = `
    mutation {
      stockLocation {
        create (
          input: {
            identifier: "europe-warehouse",
            name: "Europe Warehouse",
            tenantId: "1234",
            settings: {
              minimum: 0
            }
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
