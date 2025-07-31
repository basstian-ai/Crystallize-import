"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setPriceVariants = exports.getExistingPriceVariants = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_1 = require("../../graphql");
const build_update_price_variant_mutation_1 = require("../../graphql/build-update-price-variant-mutation");
async function getExistingPriceVariants(context) {
    var _a, _b;
    const tenantId = context.tenantId;
    const r = await context.callPIM({
        query: (0, graphql_tag_1.default) `
      query GET_TENANT_PRICE_VARIANTS($tenantId: ID!) {
        priceVariant {
          getMany(tenantId: $tenantId) {
            identifier
            name
            currency
          }
        }
      }
    `,
        variables: {
            tenantId,
        },
    });
    return ((_b = (_a = r.data) === null || _a === void 0 ? void 0 : _a.priceVariant) === null || _b === void 0 ? void 0 : _b.getMany) || [];
}
exports.getExistingPriceVariants = getExistingPriceVariants;
async function setPriceVariants({ spec, onUpdate, context, }) {
    // Get all the price variants from the tenant
    const existingPriceVariants = await getExistingPriceVariants(context);
    if (!(spec === null || spec === void 0 ? void 0 : spec.priceVariants)) {
        return existingPriceVariants;
    }
    const specVariants = spec.priceVariants || [];
    const existingPriceVariantsIdentifiers = existingPriceVariants.map((p) => p.identifier);
    const updatePriceVariants = specVariants.filter((p) => existingPriceVariantsIdentifiers.includes(p.identifier));
    const addPriceVariants = specVariants.filter((p) => !existingPriceVariantsIdentifiers.includes(p.identifier));
    let finished = 0;
    const { tenantId } = context;
    // Updating existing price variants
    if (updatePriceVariants.length > 0) {
        onUpdate({
            message: `Updating ${addPriceVariants.length} price variant(s)...`,
        });
        await Promise.all(updatePriceVariants.map(async (priceVariant) => {
            const result = await context.callPIM((0, build_update_price_variant_mutation_1.buildUpdatePriceVariantQueryAndVariables)({
                tenantId,
                identifier: priceVariant.identifier,
                input: {
                    currency: priceVariant.currency,
                    name: priceVariant.name,
                },
            }));
            finished++;
            onUpdate({
                progress: finished / specVariants.length,
                message: `${priceVariant.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'updated'}`,
            });
        }));
    }
    // Adding missing price variants
    if (addPriceVariants.length > 0) {
        onUpdate({
            message: `Adding ${addPriceVariants.length} price variant(s)...`,
        });
        await Promise.all(addPriceVariants.map(async (priceVariant) => {
            const result = await context.callPIM({
                query: (0, graphql_1.buildCreatePriceVariantMutation)({
                    tenantId,
                    identifier: priceVariant.identifier,
                    name: priceVariant.name,
                    currency: priceVariant.currency,
                }),
            });
            finished++;
            onUpdate({
                progress: finished / specVariants.length,
                message: `${priceVariant.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'added'}`,
            });
        }));
    }
    onUpdate({
        progress: 1,
    });
    return getExistingPriceVariants(context);
}
exports.setPriceVariants = setPriceVariants;
