"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const component_input_1 = require("../types/shapes/components/component.input");
const shape_input_1 = require("../types/shapes/shape.input");
const build_create_shape_mutation_1 = require("./build-create-shape-mutation");
(0, ava_1.default)('create mutation for shape without components', (t) => {
    const shape = {
        identifier: 'my-shape',
        tenantId: '1234',
        name: 'Some Shape',
        type: shape_input_1.shapeTypes.product,
    };
    const got = (0, build_create_shape_mutation_1.buildCreateShapeMutation)(shape).replace(/ /g, '');
    const want = `
    mutation {
      shape {
        create (
          input: {
            identifier: "my-shape",
            tenantId: "1234",
            name: "Some Shape",
            type: product
          }
        ) {
          identifier
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('create mutation for shape with basic components', (t) => {
    const input = {
        identifier: 'my-shape',
        tenantId: '1234',
        name: 'Some Shape with Basic Components',
        type: shape_input_1.shapeTypes.document,
        components: [
            {
                id: 'images',
                name: 'Images',
                type: component_input_1.componentTypes.images,
            },
            {
                id: 'description',
                name: 'Description',
                type: component_input_1.componentTypes.richText,
            },
        ],
    };
    const got = (0, build_create_shape_mutation_1.buildCreateShapeMutation)(input).replace(/ /g, '');
    const want = `
    mutation {
      shape {
        create (
          input: {
            identifier: "my-shape",
            tenantId: "1234",
            name: "Some Shape with Basic Components",
            type: document,
            components: [
              {
                id: "images",
                name: "Images",
                type: images
              },
              {
                id: "description",
                name: "Description",
                type: richText
              }
            ]
          }
        ) {
          identifier
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
(0, ava_1.default)('create mutation for shape with complex components', (t) => {
    const input = {
        identifier: 'my-shape',
        tenantId: '1234',
        name: 'Some Shape with Complex Components',
        type: shape_input_1.shapeTypes.document,
        components: [
            {
                id: 'chunk',
                name: 'Chunk',
                type: component_input_1.componentTypes.contentChunk,
                config: {
                    contentChunk: {
                        components: [
                            {
                                id: 'relation',
                                name: 'Relation',
                                type: component_input_1.componentTypes.itemRelations,
                            },
                            {
                                id: 'isFeatured',
                                name: 'Is Featured',
                                type: component_input_1.componentTypes.boolean,
                            },
                        ],
                        repeatable: true,
                    },
                },
            },
            {
                id: 'properties',
                name: 'Properties',
                type: component_input_1.componentTypes.propertiesTable,
                config: {
                    propertiesTable: {
                        sections: [
                            {
                                title: 'Dimensions',
                                keys: ['width', 'length', 'height'],
                            },
                        ],
                    },
                },
            },
        ],
    };
    const got = (0, build_create_shape_mutation_1.buildCreateShapeMutation)(input).replace(/ /g, '');
    const want = `
    mutation {
      shape {
        create (
          input: {
            identifier: "my-shape",
            tenantId: "1234",
            name: "Some Shape with Complex Components",
            type: document,
            components: [
              {
                id: "chunk",
                name: "Chunk",
                type: contentChunk,
                config: {
                  contentChunk: {
                    components: [
                      {
                        id: "relation",
                        name: "Relation",
                        type: itemRelations
                      },
                      {
                        id: "isFeatured",
                        name: "Is Featured",
                        type: boolean
                      }
                    ],
                    repeatable: true
                  }
                }
              },
              {
                id: "properties",
                name: "Properties",
                type: propertiesTable,
                config: {
                  propertiesTable: {
                    sections: [
                      {
                        title: "Dimensions",
                        keys: ["width", "length", "height"]
                      }
                    ]
                  }
                }
              }
            ]
          }
        ) {
          identifier
          name
        }
      }
    }
  `
        .replace(/\n/g, '')
        .replace(/ /g, '');
    t.is(got, want, 'mutation string should match');
});
