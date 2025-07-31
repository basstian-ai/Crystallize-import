import { StockLocation } from '../../types';
import { JsonSpec, JSONStockLocation as JsonStockLocation } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
export declare function getExistingStockLocations(context: BootstrapperContext): Promise<StockLocation[]>;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setStockLocations({ spec, onUpdate, context, }: Props): Promise<JsonStockLocation[]>;
