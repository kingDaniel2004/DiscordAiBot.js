

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

const tf = require('@tensorflow/tfjs-node')
// Load the binding (CPU computation)
const mobilenet = require('@tensorflow-models/mobilenet');
//const coco = require('@microduino/tf-coco-ssd');
const coco = require('@tensorflow-models/coco-ssd');
// for getting the data images
var image = require('get-image-data')

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    open = require('open');
const { mod } = require('@tensorflow/tfjs-node');


    // for getting the data images

//var image = require('get-image-data')

//const ml5 = require('ml5');
//var ml5 = require('ml5');

//global
//import * as tf from '@tensorflow/tfjs-node'
//var tf = require('@tensorflow/tfjs-node');
//var MN = require('@tensorflow-models/mobilenet');
//tf.setBackend('cpu');
//tf.ready();

client.login(process.env.BOTTOKEN);

client.on('ready', readyDiscord => {console.log("Bot is online...");});

client.on('message', gotMsg);


//>= == === >== ==> >< >< >< <> <=> <===> <==>

const prefix = ".";
var MSG;

function gotMsg(msg) {
    MSG = msg;

    //console.log(msg);
    //console.log(msg.content);
    if (!msg.content.startsWith(prefix)) return;

    if (checkURL(msg.content)){
        //msg.reply("A valid image"); 
        var url = msg.content.substring(prefix.length);
        console.log('\n\n\n\n image loading...\n');
        classfy(url);
    } else {
        var url = msg.content.substring(prefix.length);
        console.log('\n\n\n\n image loading...\n');
        classfy(url);
        //msg.reply("NO invalid image");
    }

}

function modelReady(){
    console.log("Model is ready");
}

async function classfy(url){


    /*
    //classifer = tf.ima
    const modle = MN.load();

    const predictions = await model.classify(url);

    console.log(predictions);
    //open(url);
    */

    console.log(url);

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
            //await load_mobilenet(input)
            await load_coco(input)
        }catch(e){
            console.log(e);
            //functionToHandleError(e);
        }
    });

}


async function load_coco(img){
    const model = await coco.load();
    console.log(model);
    console.log("1");

    const predictions = await model.detect(img);
    console.log(predictions);
    console.log("2");

    //model.detect(img, gotDetections);

}

function gotDetections(error, results){
    console.log("Model ready");
    console.log(results);
}


async function load_mobilenet(img){
    // Load the model.
    const model = await mobilenet.load();

    // Classify the image.
    const predictions = await model.classify(img);

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
}


function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}


