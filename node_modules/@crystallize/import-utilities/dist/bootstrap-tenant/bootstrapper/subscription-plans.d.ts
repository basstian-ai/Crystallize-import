import { JsonSpec } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
import { SubscriptionPlan } from '../../generated/graphql';
export declare function getExistingSubscriptionPlans(context: BootstrapperContext): Promise<SubscriptionPlan[]>;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setSubscriptionPlans({ spec, onUpdate, context, }: Props): Promise<SubscriptionPlan[]>;
