require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client();

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const tf = require('@tensorflow/tfjs-node')
const mobilenet = require('@tensorflow-models/mobilenet');
const coco = require('@tensorflow-models/coco-ssd');
var image = require('get-image-data')
const { createCanvas, loadImage } = require('canvas')


/*




// Write "Awesome!"

// Draw line under text

// Draw cat with lime helmet

*/

var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    open = require('open');

//const { mod } = require('@tensorflow/tfjs-node');


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
var MSG, url;

function gotMsg(msg) {
    MSG = msg;

    //console.log(msg);
    //console.log(msg.content);
    if (!msg.content.startsWith(prefix)) return;

    if (checkURL(msg.content)){
        //msg.reply("A valid image"); 
        url = msg.content.substring(prefix.length);
        //console.log('\n\n\n\n image loading...\n');
        //classfy(url);
        name();
    } else {
        url = msg.content.substring(prefix.length);
        console.log('\n\n\n\n image loading...\n');
        classfy(url);
        //msg.reply("NO invalid image");
    }

}




async function name(){
    url = 'https://i.imgur.com/wCsQLGC.png'
    var myimg = await loadImage(url) 
    ctx.drawImage(myimg, 0, 0, canvas.width, canvas.height);  
    console.log("testin");
    open(canvas.toDataURL(), {app: 'firefox'});
}

loadImage(url).then((image) => {
ctx.drawImage(image, 50, 0, 70, 70)

console.log('<img src="' + canvas.toDataURL() + '" />')
})

var ImageHeight, ImageWidth;
const canvas = createCanvas(596, 451)
//const canvas = loadImage(url).cr;
const ctx = canvas.getContext('2d')

function modelReady(result){
    //name();


    /*
    var url = 'https://i.imgur.com/wCsQLGC.png'
    var myimg = await loadImage(url) 
    ctx.drawImage(myimg, 0, 0, canvas.width, canvas.height);  

    console.log("Model is ready");
    //ctx.drawImage(url, 10, 10);
    //console.log(result);

    console.log(result[1].bbox[1]);
    for (let i = 0; i < result.length; i++){
        let obj = result[i].bbox;
        ctx.stroke(0, 255, 0);
        //ctx.fill();
        ctx.rect(obj[0], obj[1], obj[2], obj[3]);
        console.log("class: " + obj.class);
        console.log("x: " + obj[0]);
        console.log("y: " + obj[1]);
        console.log("w: " + obj[2]);
        console.log("h: " + obj[3]);
        console.log("\n");
    }

    open(canvas.toDataURL(), {app: 'firefox'});
    */
}


async function classfy(url){

    /*
    //classifer = tf.ima
    const modle = MN.load();

    const predictions = await model.classify(url);

    console.log(predictions);
    */
    //open(url);

    console.log("url: " + url);

    image(url, async function (err, image) {
        try{
            const numChannels = 3;
            ImageHeight = image.height;
            ImageWidth = image.width;
            console.log(ImageWidth);
            console.log(ImageHeight);
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
            //functionToHandleError(e);
        }
    });
}


async function load_coco(img){
    const model = await coco.load();
    const predictions = await model.detect(img);
    modelReady(predictions);
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


