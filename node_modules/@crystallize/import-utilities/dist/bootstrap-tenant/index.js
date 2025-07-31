"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrapTenant = exports.createJSONSpec = exports.EVENT_NAMES = exports.Bootstrapper = void 0;
const bootstrapper_1 = require("./bootstrapper");
var bootstrapper_2 = require("./bootstrapper");
Object.defineProperty(exports, "Bootstrapper", { enumerable: true, get: function () { return bootstrapper_2.Bootstrapper; } });
var utils_1 = require("./bootstrapper/utils");
Object.defineProperty(exports, "EVENT_NAMES", { enumerable: true, get: function () { return utils_1.EVENT_NAMES; } });
async function createJSONSpec(props) {
    const bootstrapper = new bootstrapper_1.Bootstrapper();
    bootstrapper.setAccessToken(props.CRYSTALLIZE_ACCESS_TOKEN_ID, props.CRYSTALLIZE_ACCESS_TOKEN_SECRET);
    bootstrapper.setTenantIdentifier(props.tenantIdentifier);
    return bootstrapper.createSpec({
        shapes: true,
        grids: true,
        items: true,
        languages: true,
        priceVariants: true,
        vatTypes: true,
        subscriptionPlans: true,
        topicMaps: true,
        stockLocations: true,
        onUpdate: props.onUpdate,
    });
}
exports.createJSONSpec = createJSONSpec;
function bootstrapTenant(props) {
    const bootstrapper = new bootstrapper_1.Bootstrapper();
    bootstrapper.setTenantIdentifier(props.tenantIdentifier);
    bootstrapper.setAccessToken(props.CRYSTALLIZE_ACCESS_TOKEN_ID, props.CRYSTALLIZE_ACCESS_TOKEN_SECRET);
    bootstrapper.setSpec(props.jsonSpec);
    // Allow for event listeners to be registered
    setTimeout(() => {
        bootstrapper.start();
    }, 5);
    return bootstrapper;
}
exports.bootstrapTenant = bootstrapTenant;
