"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidItemRelationShapeIdentifier = void 0;
class InvalidItemRelationShapeIdentifier extends Error {
    constructor(identifier) {
        super(identifier);
        this.name = 'InvalidItemRelationShapeIdentifier';
    }
}
exports.InvalidItemRelationShapeIdentifier = InvalidItemRelationShapeIdentifier;
