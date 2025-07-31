"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setStockLocations = exports.getExistingStockLocations = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_1 = require("../../graphql");
async function getExistingStockLocations(context) {
    var _a, _b;
    const tenantId = context.tenantId;
    const r = await context.callPIM({
        query: (0, graphql_tag_1.default) `
      query GET_TENANT_STOCK_LOCATIONS($tenantId: ID!) {
        stockLocation {
          getMany(tenantId: $tenantId) {
            identifier
            name
            settings {
              minimum
              unlimited
            }
          }
        }
      }
    `,
        variables: {
            tenantId,
        },
    });
    return ((_b = (_a = r.data) === null || _a === void 0 ? void 0 : _a.stockLocation) === null || _b === void 0 ? void 0 : _b.getMany) || [];
}
exports.getExistingStockLocations = getExistingStockLocations;
async function setStockLocations({ spec, onUpdate, context, }) {
    // Get all the stock locations from the tenant
    const existingStockLocations = await getExistingStockLocations(context);
    if (!(spec === null || spec === void 0 ? void 0 : spec.stockLocations)) {
        return existingStockLocations;
    }
    const existingStockLocationsIdentifiers = existingStockLocations.map((sl) => sl.identifier);
    const missingStockLocations = spec.stockLocations.filter((sl) => !existingStockLocationsIdentifiers.includes(sl.identifier));
    if (missingStockLocations.length > 0) {
        onUpdate({
            message: `Adding ${missingStockLocations.length} stock location(s)...`,
        });
        const tenantId = context.tenantId;
        let finished = 0;
        await Promise.all(missingStockLocations.map(async (stockLocation) => {
            const result = await context.callPIM({
                query: (0, graphql_1.buildCreateStockLocationMutation)(Object.assign({ tenantId, identifier: stockLocation.identifier, name: stockLocation.name }, (stockLocation.minimum
                    ? { settings: { minimum: stockLocation.minimum } }
                    : {}))),
            });
            finished++;
            onUpdate({
                progress: finished / missingStockLocations.length,
                message: `${stockLocation.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'added'}`,
            });
        }));
    }
    onUpdate({
        progress: 1,
    });
    const stockLocations = [...existingStockLocations, ...missingStockLocations];
    return stockLocations;
}
exports.setStockLocations = setStockLocations;
