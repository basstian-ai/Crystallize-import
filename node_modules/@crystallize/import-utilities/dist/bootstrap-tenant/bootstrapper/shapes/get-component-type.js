"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentType = void 0;
const types_1 = require("../../../types");
const getComponentType = (type) => {
    return types_1.componentTypes[type];
};
exports.getComponentType = getComponentType;
