import { DocumentNode } from 'graphql';
import { CreateOrderInput } from '../types';
export declare function buildCreateOrderMutation(input: CreateOrderInput): {
    query: DocumentNode;
    variables: Record<string, any>;
};
