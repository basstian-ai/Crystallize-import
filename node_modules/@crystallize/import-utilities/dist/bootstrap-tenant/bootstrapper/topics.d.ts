import { JsonSpec, JSONTopic } from '../json-spec';
import { AreaUpdate, BootstrapperContext } from './utils';
export { getAllTopicsForSpec } from './utils/get-all-topics';
export declare function removeTopicId(topic: JSONTopic): JSONTopic;
export interface Props {
    spec: JsonSpec | null;
    onUpdate(t: AreaUpdate): any;
    context: BootstrapperContext;
}
export declare function setTopics({ spec, onUpdate, context, }: Props): Promise<void>;
