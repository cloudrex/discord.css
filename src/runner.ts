import Parser, {IBlock, IField} from "./parser";
import fs from "fs";
import {Client, Message} from "discord.js";

const args: string[] = process.argv;

args.splice(0, 2);

if (!fs.existsSync(args[0])) {
    console.log("! File not found.");
    process.exit();
}

export type IBotConfig = {
    token: string;
    status?: string;
    prefix: string;
};

const input: string = fs.readFileSync(args[0]).toString();
const parser: Parser = new Parser(input);
const result: IBlock[] = parser.parse();

let botConfig: Partial<IBotConfig> = {
    //
};

const bot: Client = new Client();
const commands: Map<string, string> = new Map();

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

                    case "prefix": {
                        botConfig.prefix = field.value;

                        break;
                    }

                    default: {
                        throw new Error(`Unknown field name: ${field.name}`);
                    }
                }
            }

            break;
        }

        case "command": {
            let name: string | null = null;

            for (let i = 0; i < block.fields.length; i++) {
                const field: IField = block.fields[i];

                switch (field.name) {
                    case "name": {
                        name = field.value;

                        break;
                    }

                    case "message": {
                        if (name !== null) {
                            commands.set(name, field.value);

                            break;
                        }
                        else {
                            throw new Error("Expecting command name")
                        }
                    }

                    default: {
                        throw new Error(`Unexpected field name: ${field.name}`);
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

if (!botConfig.prefix || !botConfig.token) {
    throw new Error("Missing required bot fields!");
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

bot.on("message", (msg: Message) => {
    if (msg.content.startsWith(botConfig.prefix as string)) {
        const args: string[] = msg.content.substr((botConfig.prefix as string).length).split(" ");

        if (commands.has(args[0])) {
            msg.channel.send((commands.get(args[0]) as string).replace("[ping]", bot.ping.toString()));
        }
    }
});

bot.login(botConfig.token);