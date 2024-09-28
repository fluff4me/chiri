import type { ChiriType } from "../../../type/ChiriType";
import type { PromiseOr } from "../../../util/Type";
import type ChiriReader from "../../ChiriReader";
import type { ChiriPosition } from "../../ChiriReader";
import type consumeExpression from "./consumeExpression";
interface ExpressionConstruct<T> {
    consumeOptional(reader: ChiriReader, expressionConsumer: typeof consumeExpression, ...expectedTypes: ChiriType[]): Promise<T | undefined>;
}
interface ExpressionConstructFactoryInfo {
    reader: ChiriReader;
    consumeExpression: typeof consumeExpression;
    expectedTypes: ChiriType[];
    position: ChiriPosition;
}
interface ExpressionConstructFactory {
    consume<T>(consumer: (info: ExpressionConstructFactoryInfo) => PromiseOr<T | undefined>): ExpressionConstruct<T>;
}
declare function ExpressionConstruct(name: string): ExpressionConstructFactory;
export default ExpressionConstruct;
