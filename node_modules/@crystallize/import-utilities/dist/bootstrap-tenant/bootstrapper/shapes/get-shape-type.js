"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShapeType = void 0;
const types_1 = require("../../../types");
const getShapeType = (type) => {
    return types_1.shapeTypes[type];
};
exports.getShapeType = getShapeType;
