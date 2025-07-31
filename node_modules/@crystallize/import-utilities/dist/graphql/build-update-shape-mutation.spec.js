"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const component_input_1 = require("../types/shapes/components/component.input");
const build_update_shape_mutation_1 = require("./build-update-shape-mutation");
(0, ava_1.default)('update mutation for shape without components', (t) => {
    const shape = {
        id: 'some-id',
        identifier: 'my-shape',
        tenantId: '1234',
        input: {
            name: 'my shape (updated)',
        },
    };
    const got = (0, build_update_shape_mutation_1.buildUpdateShapeMutation)(shape).replace(/ /g, '');
    const want = `
    mutation {
      shape {
        update (
          id: "some-id",
          identifier: "my-shape",
          tenantId: "1234",
          input: {
            name: "my shape (updated)"
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
(0, ava_1.default)('update mutation for shape with basic components', (t) => {
    const input = {
        id: 'some-id',
        identifier: 'my-shape',
        tenantId: '1234',
        input: {
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
        },
    };
    const got = (0, build_update_shape_mutation_1.buildUpdateShapeMutation)(input).replace(/ /g, '');
    const want = `
    mutation {
      shape {
        update (
          id: "some-id",
          identifier: "my-shape",
          tenantId: "1234",
          input: {
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
