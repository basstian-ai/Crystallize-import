import { JsonSpec } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
interface ISetGrids {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
    allowUpdate?: boolean;
}
export declare function setGrids(props: ISetGrids): Promise<void>;
export {};
