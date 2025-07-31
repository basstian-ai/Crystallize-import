import { DocumentNode } from 'graphql';
import { ItemType, UpdateItemInput } from '../types';
export declare const buildUpdateItemMutation: (id: string, input: UpdateItemInput, type: ItemType, language: string) => string;
export declare function buildUpdateItemQueryAndVariables(id: string, input: UpdateItemInput, type: ItemType, language: string): {
    query: DocumentNode;
    variables: Record<string, any>;
};
