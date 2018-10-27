import Patterns from "./patterns";

export type IField = {
    readonly name: string;
    readonly value: string;
}

export type IBlock = {
    readonly name: string;
    readonly fields: IField[];
}

export default class Parser {
    private readonly input: string;

    public constructor(input: string) {
        this.input = input;
    }

    public parse(): IBlock[] {
        const blocks: IBlock[] = [];

        let match: RegExpMatchArray | null = [];

        // Blocks
        while ((match = Patterns.block.exec(this.input)) !== null) {
            blocks.push(this.parseBlock(match[0], match[1]));
        }

        return blocks;
    }    

    private parseBlock(blockString: string, name: string): IBlock {
        const fields: IField[] = [];

        let match: RegExpMatchArray | null = [];

        while ((match = Patterns.field.exec(blockString)) !== null) {
            fields.push(this.parseField(match));
        }

        return {
            name,
            fields
        };
    }

    private parseField(match: RegExpMatchArray): IField {
        return {
            name: match[1],
            value: match[2]
        };
    }
}