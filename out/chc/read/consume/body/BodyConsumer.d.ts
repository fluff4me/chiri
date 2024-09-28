import type { PromiseOr } from "../../../util/Type";
import type ChiriReader from "../../ChiriReader";
import type { ChiriBodyConsumer } from "../../ChiriReader";
import type { ChiriContextType } from "./Contexts";
interface BodyConsumer<T, ARGS extends any[]> {
    context: ChiriContextType;
    (reader: ChiriReader, ...args: ARGS): PromiseOr<T | undefined>;
}
declare function BodyConsumer<T, ARGS extends any[]>(context: ChiriContextType, consumer: (reader: ChiriReader, ...args: ARGS) => T | undefined): BodyConsumer.Sync<T, ARGS>;
declare function BodyConsumer<T, ARGS extends any[]>(context: ChiriContextType, consumer: (reader: ChiriReader, ...args: ARGS) => PromiseOr<T | undefined>): BodyConsumer<T, ARGS>;
declare namespace BodyConsumer {
    interface Sync<T, ARGS extends any[]> {
        context: ChiriContextType;
        (reader: ChiriReader, ...args: ARGS): T | undefined;
    }
    function is<T>(consumer?: ChiriBodyConsumer<T>): consumer is BodyConsumer<T, []>;
}
export default BodyConsumer;
