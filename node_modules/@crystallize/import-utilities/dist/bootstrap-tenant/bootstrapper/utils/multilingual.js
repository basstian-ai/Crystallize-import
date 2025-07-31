"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeInTranslations = exports.trFactory = exports.translationFieldIdentifier = void 0;
exports.translationFieldIdentifier = 'this is a safe string used for identifying translation fields in the spec';
function trFactory(language) {
    return (value, id) => ({
        [exports.translationFieldIdentifier]: id,
        [language]: value,
    });
}
exports.trFactory = trFactory;
function mergeInTranslations(targetThing, sourceThing) {
    function handleThing(thing) {
        if (Array.isArray(thing)) {
            thing.forEach(handleThing);
        }
        else if (thing && typeof thing === 'object') {
            try {
                const trId = thing[exports.translationFieldIdentifier];
                if (trId) {
                    const target = findInTarget(trId);
                    if (target) {
                        Object.assign(target, thing);
                    }
                }
                else {
                    Object.values(thing).forEach(handleThing);
                }
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    function findInTarget(id) {
        let found = null;
        function search(thing) {
            if (found) {
                return;
            }
            if (Array.isArray(thing)) {
                thing.forEach(search);
            }
            else if (thing && typeof thing === 'object') {
                try {
                    const trId = thing[exports.translationFieldIdentifier];
                    if (trId) {
                        if (trId === id) {
                            found = thing;
                        }
                    }
                    else {
                        Object.values(thing).forEach(search);
                    }
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
        search(targetThing);
        return found;
    }
    handleThing(sourceThing);
    return targetThing;
}
exports.mergeInTranslations = mergeInTranslations;
