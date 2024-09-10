import ChiriReader from "../../ChiriReader";

export default (reader: ChiriReader) => reader.consumeOptional("#once") && reader.setOnce();
