/*
const { createCanvas, loadImage } = require('canvas')
const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')
open = require('open');
*/ 
// Write "Awesome!"
/*
ctx.font = '30px Impact'
ctx.rotate(0.1)
ctx.fillText('what!', 50, 100)
*/
 
/*
// Draw line under text
var text = ctx.measureText('what!')
ctx.strokeStyle = 'rgba(0,0,0,0.5)'
ctx.beginPath()
ctx.lineTo(50, 102)
ctx.lineTo(50 + text.width, 102)
ctx.stroke()
*/

//var myimg;


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


var fs = require('fs'),
    http = require('http'),
    url = require('url'),
    open = require('open');

const canvas = createCanvas(200, 200)
const ctx = canvas.getContext('2d')


client.login(process.env.BOTTOKEN);
client.on('ready', readyDiscord => {console.log("Bot is online...");});
client.on('message', gotMsg);



var MSG, url;

function gotMsg(msg) {
    MSG = msg;

    //console.log(msg);
    //console.log(msg.content);
    if (!msg.content.startsWith(prefix)) return;

    if (checkURL(msg.content)){
        //msg.reply("A valid image"); 
        url = msg.content.substring(prefix.length);
        console.log('\n\n\n\n image loading...\n');
        classfy(url);
        //name();
    } else {
        url = msg.content.substring(prefix.length);
        console.log('\n\n\n\n image loading...\n');
        classfy(url);
        //msg.reply("NO invalid image");
    }

}

async function modelReady(result){

    var myimg = await loadImage(url) 
    //ctx.drawImage(myimg, 0, 0, canvas.width, canvas.height);  
    console.log(canvas.width);
    console.log(canvas.height);

    ctx.drawImage(myimg, 0, 0, canvas.width, canvas.height);  


    console.log("Model is ready");
    //ctx.drawImage(url, 10, 10);
    //console.log(result);

    //open(canvas.toDataURL(), {app: 'firefox'});
    console.log(result[1].bbox[1]);
    for (let i = 0; i < result.length; i++){
        let obj = result[i].bbox;
        //ctx.stroke(0, 255, 0);
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

function checkURL(url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}




async function name(){
    var url = 'https://i.imgur.com/wcsqlgc.png'
    var myimg = await loadimage(url) 
    ctx.drawimage(myimg, 0, 0, canvas.width, canvas.height);  
    console.log("testin");
    open(canvas.todataurl(), {app: 'firefox'});
}



//ctx.fillStyle = '#fff'
//ctx.fillRect(0, 0, width, height)
//open(url, {app: 'firefox'});

/*
myimg.then(() => {
    //open(myimg, );

    //open(canvas.toDataURL, {app: 'firefox'});
    open(canvas.toBuffer, {app: 'firefox'});
    //console.loadImage(myimg)
    console.log("hello")
    //open(url);

}).catch(err => {
  console.log('oh no!', err)
})
*/

/*
// Draw cat with lime helmet
 loadImage(url).then((image) => {
  //ctx.drawImage(image, 50, 0, 70, 70)
   //open(canvas.toDataURL, {app: 'firefox'});
   //open(canvas, {app: 'firefox'});
   //open(url, {app: 'firefox'});
 
  //console.log('<img src="' + canvas.toDataURL() + '" />')
})
*/