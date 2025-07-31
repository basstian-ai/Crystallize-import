import { DocumentNode } from 'graphql';
import { CreateItemInput, ItemType } from '../types';
export declare const buildCreateItemMutation: (input: CreateItemInput, type: ItemType, language: string) => string;
export declare function buildCreateItemQueryAndVariables(input: CreateItemInput, type: ItemType, language: string): {
    query: DocumentNode;
    variables: Record<string, any>;
};
