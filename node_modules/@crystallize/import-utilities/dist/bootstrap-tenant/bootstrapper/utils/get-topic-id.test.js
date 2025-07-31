"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const get_topic_id_1 = require("./get-topic-id");
const testCases = [
    {
        name: 'gets topic id by path from context if it exists',
        props: {
            context: {
                topicPathToIDMap: new Map().set('/foo/bar/baz', 'some-topic-id'),
            },
            language: 'en',
            topic: {
                path: '/foo/bar/baz',
            },
            useCache: true,
        },
        expected: {
            topicId: 'some-topic-id',
            tenantId: 'some-tenant',
        },
    },
    {
        name: 'gets topic id by path from the api if it exists',
        props: {
            context: {
                tenantId: 'some-tenant',
                topicPathToIDMap: new Map(),
                callPIM: async (_) => ({
                    data: {
                        topic: {
                            get: {
                                id: 'some-topic-id',
                            },
                        },
                    },
                }),
            },
            language: 'en',
            topic: {
                path: '/foo/bar/baz',
            },
            useCache: true,
        },
        expected: {
            topicId: 'some-topic-id',
            tenantId: 'some-tenant',
        },
    },
];
testCases.forEach((tc) => ava_1.default.serial(tc.name, async (t) => {
    const actual = await (0, get_topic_id_1.getTopicId)(tc.props);
    t.deepEqual(actual, tc.expected.topicId, 'id matches expected value');
}));
