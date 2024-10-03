import type { ChiriStatement } from "../../ChiriReader";
import type BodyConsumer from "./BodyConsumer";
import type { ChiriContextType } from "./Contexts";
declare const BodyRegistry: {
    function: BodyConsumer.Sync<Promise<ChiriStatement | undefined>, []>;
    inherit: undefined;
    generic: undefined;
    root: undefined;
    mixin: undefined;
    component: undefined;
    state: undefined;
    pseudo: undefined;
    "property-name": BodyConsumer.Sync<import("../consumeWordInterpolatedOptional").ChiriWordInterpolated, []>;
    paths: BodyConsumer.Sync<import("../consumePathOptional").ChiriPath, []>;
    text: BodyConsumer.Sync<import("../consumeValueText").ChiriValueText, []>;
};
export default BodyRegistry;
export type ContextStatement<CONTEXT extends ChiriContextType> = (typeof BodyRegistry)[CONTEXT] extends BodyConsumer<infer T, []> ? T : ChiriStatement;
