require('dotenv').config();
//discord js
const Discord = require('discord.js');
const client = new Discord.Client();

//ML lib
const tf = require('@tensorflow/tfjs-node')
const coco = require('@tensorflow-models/coco-ssd');
var image = require('get-image-data')


//activate the bot
client.login(process.env.BOTTOKEN);
client.on('ready', readyDiscord => {console.log("Bot is online...");});
client.on('message', gotMsg);


const prefix = ".";
var MSG;

function gotMsg(msg) {
    MSG = msg;
    if (!msg.content.startsWith(prefix)) return;

    url = msg.content.substring(prefix.length);
    classfy(url);
}

async function classfy(url){
    image(url, async function (err, image) {
        try{
            const numChannels = 3;
            const numPixels = image.width * image.height;
            const values = new Int32Array(numPixels * numChannels);
            pixels = image.data
            for (let i = 0; i < numPixels; i++) {
                for (let channel = 0; channel < numChannels; ++channel) {
                    values[i * numChannels + channel] = pixels[i * 4 + channel];
                }
            }
            const outShape = [image.height, image.width, numChannels];
            const input = tf.tensor3d(values, outShape, 'int32');

            //load the model
            await load_coco(input)
        }catch(e){
            console.log(e);
        }
    });
}

async function load_coco(img){
    const model = await coco.load();
    const predictions = await model.detect(img);
    modelReady(predictions);
}

async function modelReady(predictions){
    console.log(predictions);
    var result = "Predictions: "


    for (var i = 0; i < predictions.length; i++){
       result += "\n(" + (i+1) + ")  [" + (predictions[i].score * 100).toFixed(2) + "%] " + (predictions[i].class);
    }

    console.log(result);
    MSG.reply(result)
    MSG.react("👍")


    /*

    var result = "Predictions: ";
    console.log("printing... ");
    for (var i = 0; i < predictions.length; i++){
       console.log("printing... ");
       result += "\n (" + i + ")  [" + (predictions[i].probability * 100).toFixed(2) + "%] " + (predictions[i].className);
    }

    console.log(predictions);
    MSG.reply(result)
    console.log("output: " + result);

    //console.log(predictions[0].className);
    */


}
