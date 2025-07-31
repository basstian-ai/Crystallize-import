"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const build_tenant_query_1 = require("./build-tenant-query");
(0, ava_1.default)('create tenant query with id', (t) => {
    const got = (0, build_tenant_query_1.buildTenantQuery)('1234').replace(/ /g, '');
    const want = `
    query {
      tenant {
        get (id: "1234") {
          id
          identifier
          name
          rootItemId
          availableLanguages {
            code
            name
            system
          }
          defaults {
            language
            currency
          }
          vatTypes {
            id
            name
            percent
          }
          shapes {
            identifier
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
