import { config } from "dotenv";
config();

import {
  Attachment,
  AttachmentBuilder,
  Client,
  GatewayIntentBits,
} from "discord.js";
import { GoogleGenAI } from "@google/genai";

const { DISCORD_BOT_TOKEN, GOOGLE_API_KEY } = process.env;

const ai = new GoogleGenAI({
  apiKey: GOOGLE_API_KEY,
});

async function generateImage(prompt) {
  const res = ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
  });

  for (const part of (await res).candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imgData = part.inlineData.data;
      const buffer = Buffer.from(imgData, "base64");
      return buffer;
    }
  }
}

async function generateContent(prompt) {
  const res = await ai.models.generateContent({
    model:"gemini-2.5-flash",
    contents:prompt,
  })
  return res.text;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds, //server
    GatewayIntentBits.GuildMessages, //server pe jitne messsages aa rhe h unke baare me pta chal ajye lekin message ke content ke baare me pta na chale
    GatewayIntentBits.MessageContent,
  ],
});

client.once("clientReady", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message) => {
  const isBot = message.author.bot;

  if (isBot) return;

  const imgBuffer = await generateImage(message.content)

  if (imgBuffer) {
    const attachments = new AttachmentBuilder(imgBuffer, {
      name: "generated-image.png",
    }) 
    message.channel.send({ files: [attachments] });
  } else{
    const content = await generateContent(message.content);
    message.reply(content)
  }

  // message.reply("Hii there! Nova freedy here!");
});

// Login the bot
client.login(DISCORD_BOT_TOKEN);
