"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const types_1 = require("../types");
const build_create_item_mutation_1 = require("./build-create-item-mutation");
(0, ava_1.default)('create mutation for product', (t) => {
    const input = {
        tenantId: '1234',
        shapeIdentifier: 'cool-product',
        vatTypeId: '1234',
        name: 'Cool Product',
        variants: [
            {
                isDefault: true,
                sku: 'cool-product',
                name: 'Cool Product',
                stock: 5,
                images: [
                    {
                        key: 'some-key',
                    },
                ],
            },
        ],
    };
    const got = (0, build_create_item_mutation_1.buildCreateItemMutation)(input, types_1.ItemType.Product, 'en').replace(/ /g, '');
    const want = `
    mutation {
      product {
        create (
          input: {
            tenantId: "1234",
            shapeIdentifier: "cool-product",
            vatTypeId: "1234",
            name: "Cool Product",
            variants: [
              {
                isDefault: true,
                sku: "cool-product",
                name: "Cool Product",
                stock: 5,
                images: [{
                  key: "some-key"
                }]
              }
            ],
            components: []
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
(0, ava_1.default)('create mutation for document', (t) => {
    const input = {
        tenantId: '1234',
        shapeIdentifier: 'cool-document',
        name: 'Cool Document',
    };
    const got = (0, build_create_item_mutation_1.buildCreateItemMutation)(input, types_1.ItemType.Document, 'en').replace(/ /g, '');
    const want = `
    mutation {
      document {
        create (
          input: {
            tenantId: "1234",
            shapeIdentifier: "cool-document",
            name: "Cool Document",
            components: []
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
(0, ava_1.default)('create mutation for folder', (t) => {
    const input = {
        tenantId: '1234',
        shapeIdentifier: 'cool-folder',
        name: 'Cool Folder',
    };
    const got = (0, build_create_item_mutation_1.buildCreateItemMutation)(input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        create (
          input: {
            tenantId: "1234",
            shapeIdentifier: "cool-folder",
            name: "Cool Folder",
            components: []
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
(0, ava_1.default)('create mutation for items with components', (t) => {
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
        tenantId: '1234',
        shapeIdentifier: 'cool-folder',
        name: 'Cool Folder',
        components: {
            properties: propertiesTableComponent,
            location: locationComponent,
        },
    };
    const got = (0, build_create_item_mutation_1.buildCreateItemMutation)(input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        create (
          input: {
            tenantId: "1234",
            shapeIdentifier: "cool-folder",
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
(0, ava_1.default)('create mutation for items with content chunk component', (t) => {
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
        tenantId: '1234',
        shapeIdentifier: 'cool-folder',
        name: 'Cool Folder',
        components: {
            chunk: chunkComponent,
        },
    };
    const got = (0, build_create_item_mutation_1.buildCreateItemMutation)(input, types_1.ItemType.Folder, 'en').replace(/ /g, '');
    const want = `
    mutation {
      folder {
        create (
          input: {
            tenantId: "1234",
            shapeIdentifier: "cool-folder",
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
