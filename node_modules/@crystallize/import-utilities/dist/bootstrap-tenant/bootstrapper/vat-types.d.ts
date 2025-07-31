import { VatType } from '../../types';
import { JsonSpec } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
export declare function getExistingVatTypes(context: BootstrapperContext): Promise<VatType[]>;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setVatTypes({ spec, context, onUpdate, }: Props): Promise<VatType[]>;
