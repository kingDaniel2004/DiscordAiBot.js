require('dotenv').config();
//discord js
const Discord = require('discord.js');
const client = new Discord.Client();

//ML lib
const tf = require('@tensorflow/tfjs-node')
const coco = require('@tensorflow-models/coco-ssd');
var get_image_data = require('get-image-data')


//activate the bot
client.login(process.env.BOTTOKEN);
client.on('ready', readyDiscord => {console.log("Bot is online...");});
client.on('message', gotMsg);

//image process
var gm = require('gm').subClass({imageMagick: true});

//global vars
const prefix = ".";
var userMessage;
var userImage;
var imageURL;

//code
async function gotMsg(msg) {
    if (!msg.content.startsWith(prefix)) return;
    userMessage = msg;

    imageURL = msg.content.substring(prefix.length);

    userImage = gm(imageURL);

    classfy(imageURL);
}


async function classfy(url){
    get_image_data(url, async function (err, image) {
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
    console.log("COCO-SSD model ready... ");
    var result = "Predictions: "

    if (predictions.length == 0){
       result += "\n Sorry. I don't know what is that. ";
       userMessage.react(getemoji("none"));
    }

    userImage.stroke("#FF0000", 3)
         .fill("rgba( 255, 255, 255 , 0 )");

    //outline(draw) all the founded objects
    for (var i = 0; i < predictions.length; i++){
        var x = predictions[i].bbox[0];
        var y = predictions[i].bbox[1];
        var w = predictions[i].bbox[2];
        var h = predictions[i].bbox[3];
        userImage.drawRectangle(x, y, x+w, y+h)

        //result
        result += "\n(" + (i+1) + ")  [" + (predictions[i].score * 100).toFixed(2) + "%] " + (predictions[i].class);

        //react
        userMessage.react(getemoji(predictions[i].class));
    }

    //finally save the image locally then attach it in discord.
    const fileName = 'image.jpg'
    userImage.write(fileName, function (err) {
        if (!err) {
            console.log("New image succefully created");
            userMessage.channel.send(result, { 
                files: [fileName] 
            });
        }
    })
}









function getemoji(emoji){// /* means that emoji is not really the accurate image. 
    if(emoji === "person")          return "🧑"
    if(emoji === "backpack")        return "🎒"
    if(emoji === "bicycle")         return "🚲"
    if(emoji === "car")             return "🚗"
    if(emoji === "traffic light")   return "🚦"
    if(emoji === "fire hydrant")    return "🧯"
    if(emoji === "handbag")         return "👜"
    if(emoji === "tie")             return "👔"
    if(emoji === "suitcase")        return "🧳"
    if(emoji === "bus")             return "🚌"
    if(emoji === "truck")           return "🚚"
    if(emoji === "boat")            return "🛥️"
    if(emoji === "train")           return "🚆"
    if(emoji === "motorcycle")      return "🏍"
    if(emoji === "airplane")        return "✈"
    if(emoji === "stop sign")       return "🛑"
    if(emoji === "bench")           return "💺"
    if(emoji === "parking meter")   return "🅿️"
    if(emoji === "bird")            return "🐦"
    if(emoji === "dog")             return "🐕"
    if(emoji === "sheep")           return "🐑"
    if(emoji === "elephant")        return "🐘"
    if(emoji === "zebra")           return "🦓"
    if(emoji === "giraffe")         return "🦒"
    if(emoji === "bear")            return "🐻"
    if(emoji === "cow")             return "🐮"
    if(emoji === "horse")           return "🐴"
    if(emoji === "cat")             return "🐈"
    if(emoji === "frisbee")         return "🥏"
    if(emoji === "snowboard")       return "🏂"
    if(emoji === "kite")            return "🪁"
    if(emoji === "baseball glove")  return "🧤"
    if(emoji === "surfboard")       return "🏄"
    if(emoji === "tennis racket")   return "🎾"
    if(emoji === "baseball bat")    return "⚾"//*
    if(emoji === "bowl")            return "🥣"
    if(emoji === "knife")           return "🔪"
    if(emoji === "cup")             return "🥤"
    if(emoji === "bottle")          return "🍼"
    if(emoji === "skis")            return "🎿"
    if(emoji === "sports ball")     return "⚽"//*
    if(emoji === "skateboard")      return "🛹"
    if(emoji === "spoon")           return "🥄"
    if(emoji === "fork")            return "🍴"//*
    if(emoji === "wine glass")      return "🍷"
    if(emoji === "banana")          return "🍌"
    if(emoji === "sandwich")        return "🥪"
    if(emoji === "broccoli")        return "🥦"
    if(emoji === "hot dog")         return "🌭"
    if(emoji === "donut")           return "🍩"
    if(emoji === "cake")            return "🎂"
    if(emoji === "pizza")           return "🍕"
    if(emoji === "carrot")          return "🥕"
    if(emoji === "orange")          return "🍊"
    if(emoji === "apple")           return "🍎"
    if(emoji === "chair")           return "🪑"
    if(emoji === "potted plant")    return "🪴"
    //if(emoji === "dining table")  return ""
    if(emoji === "toilet")          return "🚽"
    if(emoji === "bed")             return "🛏"
    if(emoji === "couch")           return "🛋"
    if(emoji === "tv")              return "📺"
    if(emoji === "mouse")           return "🖱️"
    if(emoji === "keyboard")        return "⌨️"
    if(emoji === "cell phone")      return "📱"
    if(emoji === "remote")          return "📱"//*
    if(emoji === "laptop")          return "💻"
    //if(emoji === "microwave")     return ""
    if(emoji === "toaster")         return "🍞"//*
    //if(emoji === "refrigerator")  return ""
    //if(emoji === "oven")          return ""
    //if(emoji === "sink")          return ""
    if(emoji === "book")            return "📖"
    if(emoji === "vase")            return "🏺"
    if(emoji === "teddy bear")      return "🧸"
    if(emoji === "toothbrush")      return "🪥"
    //if(emoji === "hair drier")    return ""
    if(emoji === "scissors")        return "✂️"
    if(emoji === "clock")           return "🕔"

    return "❓";
}
//sowing their own clothes, gorwing thier own food, pospoding their marrage, getting fewer babies, vacant lots



