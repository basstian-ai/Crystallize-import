import { DocumentNode } from 'graphql';
import { ItemMutationsUpdateComponentArgs } from '../generated/graphql';
export declare function buildUpdateItemComponentQueryAndVariables(variables: ItemMutationsUpdateComponentArgs): {
    query: DocumentNode;
    variables: Record<string, any>;
};
export declare function buildUpdateItemComponentMutation(props: ItemMutationsUpdateComponentArgs): string;
