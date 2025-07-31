import { PriceVariant } from '../../types';
import { JsonSpec, JSONPriceVariant as JsonPriceVariant } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
export declare function getExistingPriceVariants(context: BootstrapperContext): Promise<PriceVariant[]>;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setPriceVariants({ spec, onUpdate, context, }: Props): Promise<JsonPriceVariant[]>;
