import { DocumentNode } from 'graphql';
import { CreateCustomerInput } from '../types';
export declare function buildCreateCustomerMutation(input: CreateCustomerInput): {
    query: DocumentNode;
    variables: Record<string, any>;
};
