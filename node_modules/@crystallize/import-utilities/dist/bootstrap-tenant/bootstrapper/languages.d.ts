import { JsonSpec, JSONLanguage } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
interface TenantSettings {
    availableLanguages: JSONLanguage[];
    defaultLanguage?: string;
}
export declare function getTenantSettings(context: BootstrapperContext): Promise<TenantSettings>;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setLanguages({ spec, onUpdate, context, }: Props): Promise<JSONLanguage[]>;
export {};
