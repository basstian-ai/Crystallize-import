"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const types_1 = require("../types");
const build_update_item_mutation_1 = require("./build-update-item-mutation");
(0, ava_1.default)('update mutation for product', (t) => {
    const input = {
        vatTypeId: '1234',
        name: 'Cool Product',
        variants: [
            {
                isDefault: true,
                sku: 'cool-product',
                name: 'Cool Product',
            },
        ],
    };
    const got = (0, build_update_item_mutation_1.buildUpdateItemMutation)('1234', input, types_1.ItemType.Product, 'en').replace(/ /g, '');
    const want = `
    mutation {
      product {
        update (
          id: "1234",
          input: {
            vatTypeId: "1234",
            name: "Cool Product",
            variants: [
              {
                isDefault: true,
                sku: "cool-product",
                name: "Cool Product"
              }
            ]
          },
          language: "en"
        ) {
          id
          name
          externalReference
          tree {
            path
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('update mutation for document', (t) => {
    const input = {
        name: 'Cool Document',
    };
    const got = (0, build_update_item_mutation_1.buildUpdateItemMutation)('1234', input, types_1.ItemType.Document, 'en').replace(/ /g, '');
    const want = `
    mutation {
      document {
        update (
          id: "1234",
          input: {
            name: "Cool Document"
          },
          language: "en"
        ) {
          id
          name
          externalReference
          tree {
            path
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('update mutation for folder', (t) => {
    const input = {
        name: 'Cool Folder',
    };
    const got = (0, build_update_item_mutation_1.buildUpdateItemMutation)('1234', input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        update (
          id: "1234",
          input: {
            name: "Cool Folder"
          },
          language: "en"
        ) {
          id
          name
          externalReference
          tree {
            path
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('update mutation for items with components', (t) => {
    const propertiesTableComponent = {
        propertiesTable: {
            sections: [
                {
                    title: 'Properties',
                    properties: [
                        {
                            key: 'Coolness',
                            value: '100%',
                        },
                    ],
                },
            ],
        },
    };
    const locationComponent = {
        location: {
            lat: 123,
            long: 123,
        },
    };
    const input = {
        name: 'Cool Folder',
        components: {
            properties: propertiesTableComponent,
            location: locationComponent,
        },
    };
    const got = (0, build_update_item_mutation_1.buildUpdateItemMutation)('1234', input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        update (
          id: "1234",
          input: {
            name: "Cool Folder",
            components: [
              {
                propertiesTable: {
                  sections: [
                    {
                      title: "Properties",
                      properties: [
                        {
                          key: "Coolness",
                          value: "100%"
                        }
                      ]
                    }
                  ]
                },
                componentId: "properties"
              },
              {
                location: {
                  lat: 123,
                  long: 123
                },
                componentId: "location"
              }
            ]
          },
          language: "en"
        ) {
          id
          name
          externalReference
          tree {
            path
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('update mutation for items with content chunk component', (t) => {
    const locationComponent = {
        componentId: 'location',
        location: {
            lat: 123,
            long: 123,
        },
    };
    const numericComponent = {
        componentId: 'numeric',
        numeric: {
            number: 123,
        },
    };
    const chunkComponent = {
        contentChunk: {
            chunks: [[locationComponent, numericComponent]],
        },
    };
    const input = {
        name: 'Cool Folder',
        components: {
            chunk: chunkComponent,
        },
    };
    const got = (0, build_update_item_mutation_1.buildUpdateItemMutation)('1234', input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        update (
          id: "1234",
          input: {
            name: "Cool Folder",
            components: [
              {
                contentChunk: {
                  chunks: [
                    [
                      {
                        componentId: "location",
                        location: {
                          lat: 123,
                          long: 123
                        }
                      },
                      {
                        componentId: "numeric",
                        numeric: {
                          number: 123
                        }
                      }
                    ]
                  ]
                },
                componentId: "chunk"
              }
            ]
          },
          language: "en"
        ) {
          id
          name
          externalReference
          tree {
            path
          }
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
