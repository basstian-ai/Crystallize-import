"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopicIds = exports.getTopicId = void 0;
const graphql_tag_1 = __importDefault(require("graphql-tag"));
async function getTopicId(props) {
    var _a, _b, _c, _d, _e, _f, _g;
    const { topic, language, useCache, context, apiFn = context.callPIM } = props;
    let searchTerm = '';
    if (typeof topic === 'string') {
        searchTerm = topic;
    }
    else {
        searchTerm = topic.path || topic.hierarchy;
    }
    if (!searchTerm) {
        return null;
    }
    if (useCache) {
        const topicId = context.topicPathToIDMap.get(searchTerm);
        if (topicId) {
            return topicId;
        }
    }
    let id = null;
    if (typeof topic !== 'string' && topic.path) {
        const result = await apiFn({
            query: (0, graphql_tag_1.default) `
        query GET_TOPIC_BY_PATH(
          $tenantId: ID!
          $language: String!
          $path: String!
        ) {
          topic {
            get(
              language: $language
              path: { tenantId: $tenantId, path: $path }
            ) {
              id
            }
          }
        }
      `,
            variables: {
                tenantId: context.tenantId,
                language,
                path: searchTerm,
            },
        });
        id = ((_c = (_b = (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.topic) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.id) || null;
    }
    else {
        const result = await apiFn({
            query: (0, graphql_tag_1.default) `
        query GET_TOPIC(
          $tenantId: ID!
          $language: String!
          $searchTerm: String!
        ) {
          search {
            topics(
              tenantId: $tenantId
              language: $language
              searchTerm: $searchTerm
            ) {
              edges {
                node {
                  id
                  path
                  name
                }
              }
            }
          }
        }
      `,
            variables: {
                tenantId: context.tenantId,
                language,
                searchTerm,
            },
        });
        const edges = ((_f = (_e = (_d = result === null || result === void 0 ? void 0 : result.data) === null || _d === void 0 ? void 0 : _d.search) === null || _e === void 0 ? void 0 : _e.topics) === null || _f === void 0 ? void 0 : _f.edges) || [];
        let edge;
        if (typeof topic !== 'string' && topic.path) {
            edge = edges.find((e) => e.node.path === topic.path);
        }
        else if (typeof topic === 'string') {
            edge = edges.find((e) => e.node.name === topic);
        }
        else {
            edge = edges[0];
        }
        id = ((_g = edge === null || edge === void 0 ? void 0 : edge.node) === null || _g === void 0 ? void 0 : _g.id) || null;
    }
    if (id) {
        if (useCache) {
            context.topicPathToIDMap.set(searchTerm, id);
        }
    }
    return id;
}
exports.getTopicId = getTopicId;
async function getTopicIds({ topics, language, useCache = true, context, apiFn = context.callPIM, }) {
    const ids = await Promise.all(topics.map((topic) => getTopicId({ topic, language, useCache, context, apiFn })));
    return ids.filter(Boolean);
}
exports.getTopicIds = getTopicIds;
