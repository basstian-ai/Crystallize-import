"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLanguages = exports.getTenantSettings = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const graphql_1 = require("../../graphql");
async function getTenantSettings(context) {
    var _a, _b, _c, _d;
    const tenantId = context.tenantId;
    const r = await context.callPIM({
        query: (0, graphql_tag_1.default) `
      query GET_TENANT_LANGUAGES($tenantId: ID!) {
        tenant {
          get(id: $tenantId) {
            defaults {
              language
            }
            availableLanguages {
              code
              name
            }
          }
        }
      }
    `,
        variables: {
            tenantId,
        },
    });
    const data = ((_b = (_a = r.data) === null || _a === void 0 ? void 0 : _a.tenant) === null || _b === void 0 ? void 0 : _b.get) || {};
    const availableLanguages = data.availableLanguages || [];
    const defaultLanguage = ((_c = data === null || data === void 0 ? void 0 : data.defaults) === null || _c === void 0 ? void 0 : _c.language) || ((_d = availableLanguages[0]) === null || _d === void 0 ? void 0 : _d.code);
    {
        availableLanguages.forEach((l) => {
            l.isDefault = l.code === defaultLanguage;
        });
    }
    return {
        availableLanguages,
        defaultLanguage,
    };
}
exports.getTenantSettings = getTenantSettings;
async function setLanguages({ spec, onUpdate, context, }) {
    var _a;
    const tenantSettings = await getTenantSettings(context);
    const existingLanguages = tenantSettings.availableLanguages;
    if (!(spec === null || spec === void 0 ? void 0 : spec.languages)) {
        return tenantSettings.availableLanguages;
    }
    const existingLanguagesIdentifiers = existingLanguages.map((l) => l.code);
    const missingLanguages = spec.languages.filter((l) => !existingLanguagesIdentifiers.includes(l.code));
    if (missingLanguages.length > 0) {
        onUpdate({
            message: `Adding ${missingLanguages.length} language(s)...`,
            progress: 0,
        });
        const tenantId = context.tenantId;
        await Promise.all(missingLanguages.map(async (language) => {
            const result = await context.callPIM({
                query: (0, graphql_1.buildCreateLanguageMutation)({
                    tenantId,
                    input: {
                        code: language.code,
                        name: language.name,
                    },
                }),
            });
            onUpdate({
                message: `${language.name}: ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'added'}`,
            });
        }));
    }
    // Compose a list of all languages to be used later
    const languages = [...existingLanguages, ...missingLanguages];
    const defaultLanguage = ((_a = spec.languages.find((l) => l.isDefault)) === null || _a === void 0 ? void 0 : _a.code) ||
        tenantSettings.defaultLanguage ||
        languages[0].code;
    {
        languages.forEach((l) => {
            l.isDefault = l.code === defaultLanguage;
        });
    }
    if (defaultLanguage !== tenantSettings.defaultLanguage) {
        const result = await context.callPIM({
            query: (0, graphql_tag_1.default) `
        mutation {
          tenant {
            update(
              id: "${context.tenantId}"
              input: {
                defaults: {
                  language: "${defaultLanguage}"
                }
              }
            ) {
              id
            }
          }
        }
      `,
        });
        onUpdate({
            message: `Setting default language to "${defaultLanguage}": ${(result === null || result === void 0 ? void 0 : result.errors) ? 'error' : 'success'}`,
        });
    }
    onUpdate({
        progress: 1,
    });
    return languages;
}
exports.setLanguages = setLanguages;
