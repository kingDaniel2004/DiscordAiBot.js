
require('dotenv').config();

console.log("hello yes");

const Discord = require('discord.js');
const client = new Discord.Client();


client.login(process.env.BOTTOKEN);

client.on('ready', readyDiscord => {console.log("Bot is online...");});

client.on('message', gotMsg);


function gotMsg(msg){
    console.log(msg.content);
    if (msg.content === 'ping'){
        //msg.reply('pong');
        msg.channel.send('pong');
    }

}

