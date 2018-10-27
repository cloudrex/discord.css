import Parser, {IBlock, IField} from "./parser";
import fs from "fs";
import {Client} from "discord.js";

const args: string[] = process.argv;

args.splice(0, 2);

if (!fs.existsSync(args[0])) {
    console.log("! File not found.");
    process.exit();
}

export type IBotConfig = {
    token: string;
    status?: string;
};

const input: string = fs.readFileSync(args[0]).toString();
const parser: Parser = new Parser(input);
const result: IBlock[] = parser.parse();

let botConfig: Partial<IBotConfig> = {
    //
};

const bot: Client = new Client();

for (let block of result) {
    switch (block.name) {
        case "bot": {
            for (let i = 0; i < block.fields.length; i++) {
                const field: IField = block.fields[i];

                switch (field.name) {
                    case "token": {
                        botConfig.token = field.value;

                        break;
                    }

                    case "status": {
                        botConfig.status = field.value;

                        break;
                    }

                    default: {
                        throw new Error(`Unknown field name: ${field.name}`);
                    }
                }
            }

            break;
        }

        default: {
            throw new Error(`Unknown block name: ${block.name}`);
        }
    }
}

botConfig = botConfig as IBotConfig;

bot.on("ready", () => {
    if (botConfig.status) {
        bot.user.setActivity(botConfig.status, {
            type: "PLAYING"
        });
    }

    console.log(`Ready! | Logged in as ${bot.user.tag}`);
});

bot.login(botConfig.token);