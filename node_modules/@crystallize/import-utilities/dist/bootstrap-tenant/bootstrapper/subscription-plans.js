"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setSubscriptionPlans = exports.getExistingSubscriptionPlans = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
async function getExistingSubscriptionPlans(context) {
    var _a, _b;
    const tenantId = context.tenantId;
    const r = await context.callPIM({
        query: (0, graphql_tag_1.default) `
      query GET_TENANT_SUBSCRIPTION_PLANS($tenantId: ID!) {
        subscriptionPlan {
          getMany(tenantId: $tenantId) {
            identifier
            name
            meteredVariables {
              id
              identifier
              name
              unit
            }
            periods {
              id
              name
              initial {
                period
                unit
              }
              recurring {
                period
                unit
              }
            }
          }
        }
      }
    `,
        variables: {
            tenantId,
        },
    });
    return ((_b = (_a = r.data) === null || _a === void 0 ? void 0 : _a.subscriptionPlan) === null || _b === void 0 ? void 0 : _b.getMany) || [];
}
exports.getExistingSubscriptionPlans = getExistingSubscriptionPlans;
async function setSubscriptionPlans({ spec, onUpdate, context, }) {
    // Get all the subscription plans from the tenant
    const existingSubscriptionPlans = await getExistingSubscriptionPlans(context);
    if (!(spec === null || spec === void 0 ? void 0 : spec.subscriptionPlans)) {
        onUpdate({
            progress: 1,
        });
        return existingSubscriptionPlans;
    }
    const missingSubscriptionPlans = spec.subscriptionPlans.filter((l) => !existingSubscriptionPlans.some((s) => s.identifier === l.identifier));
    if (missingSubscriptionPlans.length > 0) {
        onUpdate({
            message: `Adding ${missingSubscriptionPlans.length} subscription plan(s)...`,
        });
        const tenantId = context.tenantId;
        let finished = 0;
        await Promise.all(missingSubscriptionPlans.map(async (subscriptionPlan) => {
            const input = {
                tenantId,
                name: subscriptionPlan.name,
                identifier: subscriptionPlan.identifier,
                periods: subscriptionPlan.periods,
                meteredVariables: subscriptionPlan.meteredVariables,
            };
            const result = await context.callPIM({
                query: (0, graphql_tag_1.default) `
            mutation CREATE_SUBSCRIPTION_PLAN(
              $input: CreateSubscriptionPlanInput!
            ) {
              subscriptionPlan {
                create(input: $input) {
                  identifier
                }
              }
            }
          `,
                variables: {
                    input,
                },
            });
            finished++;
            onUpdate({
                progress: finished / missingSubscriptionPlans.length,
                message: `${subscriptionPlan.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'added'}`,
            });
        }));
    }
    onUpdate({
        progress: 1,
    });
    return await getExistingSubscriptionPlans(context);
}
exports.setSubscriptionPlans = setSubscriptionPlans;
