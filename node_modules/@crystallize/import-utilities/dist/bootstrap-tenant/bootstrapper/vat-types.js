"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVatTypes = exports.getExistingVatTypes = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_1 = require("../../graphql");
async function getExistingVatTypes(context) {
    var _a, _b, _c;
    const tenantId = context.tenantId;
    const r = await context.callPIM({
        query: (0, graphql_tag_1.default) `
      query GET_TENANT_VAT_TYPES($tenantId: ID!) {
        tenant {
          get(id: $tenantId) {
            vatTypes {
              id
              tenantId
              name
              percent
            }
          }
        }
      }
    `,
        variables: {
            tenantId,
        },
    });
    return ((_c = (_b = (_a = r.data) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.vatTypes) || [];
}
exports.getExistingVatTypes = getExistingVatTypes;
async function setVatTypes({ spec, context, onUpdate, }) {
    // Get all the vat types from the tenant
    const existingVatTypes = await getExistingVatTypes(context);
    if (!(spec === null || spec === void 0 ? void 0 : spec.vatTypes)) {
        onUpdate({
            progress: 1,
        });
        return existingVatTypes;
    }
    const existingVatTypesIdentifiers = existingVatTypes.map((l) => l.name);
    const missingVatTypes = spec.vatTypes.filter((l) => !existingVatTypesIdentifiers.includes(l.name));
    if (missingVatTypes.length > 0) {
        onUpdate({
            message: `Adding ${missingVatTypes.length} vatType(s)...`,
        });
        const tenantId = context.tenantId;
        let finished = 0;
        await Promise.all(missingVatTypes.map(async (vatType) => {
            const result = await context.callPIM({
                query: (0, graphql_1.buildCreateVatTypeMutation)({
                    input: {
                        tenantId,
                        name: vatType.name,
                        percent: vatType.percent,
                    },
                }),
            });
            finished++;
            onUpdate({
                progress: finished / missingVatTypes.length,
                message: `${vatType.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'added'}`,
            });
        }));
    }
    onUpdate({
        progress: 1,
    });
    return getExistingVatTypes(context);
}
exports.setVatTypes = setVatTypes;
