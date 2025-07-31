import { AreaUpdate, BootstrapperContext } from '.';
import { JsonSpec } from '../json-spec';
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare const setOrders: ({ spec, onUpdate, context, }: Props) => Promise<void>;
