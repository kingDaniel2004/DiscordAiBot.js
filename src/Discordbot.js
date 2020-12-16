//Please run the code from the src directory instead of from the root direactory.
// $ROOT_DIR/src/

//*** don't forget to generate your own BotToken***. 

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
client.on('message', gotMsg);
client.on('ready', readyDiscord => {
    console.log("Bot is online..."); 
    setPresense()
});

//image process
var gm = require('gm').subClass({imageMagick: true});

//global vars
const PREFIX = "$";
var userMessage;
var userImage;
var imageURL;
var words;

//code
function gotMsg(msg) {
    if (!msg.content.startsWith(PREFIX)) return;

    userMessage = msg;
    words = userMessage.content.substring(PREFIX.length).match(/\S+/gi);
    imageURL = words[0];
    userImage = gm(imageURL);

    if (words[0] == "help"){
        getHelp();
    } else {
        imageOutputChoice(words[1]);
    }

}

function setPresense(){
    client.user.setPresence({
        activity:{
            name: "[Type : " + PREFIX + " help ]"
        }
    })
}


// input choice
function imageOutputChoice(choice){
    if      (choice == "0") imageClassfy();
    else if (choice == "1") blur(words[2]);
    else if (choice == "2") resize(words[2], words[3]);
    else if (choice == "3") colorize(words[2], words[3], words[4]);
    else if (choice == "4") contrast(words[2]);
    else if (choice == "5") flip(words[2]);
    else if (choice == "6") quality(words[2]);
    else if (choice == "7") rotate(words[2]);
    else if (choice == "8") blackNwhite();
    else getImageInfo();
}

//blur the img
function blur(level){
    userImage.blur(level, level);
    ImageSend("blur " + " (Level: " + level + " )");
}

//resize the img
async function resize(width, height){
    get_image_data(imageURL, async function (err, image) {
        width *= (image.width / 100) 
        height *= (image.height / 100)

        userImage.resize(width, height);
        ImageSend("resized -> (" + Math.floor(width) + " w: " + Math.floor(height) + " h)\n");
    });
}

//chagne color
function colorize(red, green, blue){
    userImage.colorize(red, green, blue);
    ImageSend("Colorized -> (" + red + ", " + green + ", " + blue + ") ");
}

//change contrast
function contrast(multiplier){
    userImage.contrast(Math.floor(multiplier));
    ImageSend("Contrast -> " + multiplier);
}

//flip the img
function flip(side){
    console.log(side);
    if (side == "y"){
        userImage.flip()
    } else if (side == "x"){
        userImage.flop()
    } else if (side == "xy") {
        userImage.flip()
        userImage.flop()
    } else {
        userMessage.reply("Oops... invalid flip side.")
        return;
    }

    ImageSend("flipped -> " + side);
}

//change quality
function quality(level){
    userImage.quality(level)
    ImageSend("quality -> " + level);
}

//roate img
function rotate(deg){
    userImage.rotate("rgba(111,222,333,0)", deg);
    ImageSend("rotated -> " + deg);
}

//img to B/W
function blackNwhite(){
    userImage.monochrome();
    ImageSend("Black and White");
}

//get some img's important info
function getImageInfo(){
    userImage.identify(function(err, value) {
        var info = "```";
        info += "\n format: " + value.format;
        info += "\n Geomentry: " + value.size.width +"w "+value.size.height + "h";
        info += "\n Quality: " + value.Quality 
        info += "\n Size: " + value.Filesize
        info += "\n Type: " + value.Type 
        info += "\n Depth: " + value.Depth 
        info += "```"
        if (!err) userMessage.reply(info);
    });
}

//calc the img to classfy
async function imageClassfy(){
    get_image_data(imageURL, async function (err, image) {
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

//load the model
async function load_coco(img){
    const model = await coco.load();
    const predictions = await model.detect(img);
    modelReady(predictions);
}

//call back for model
async function modelReady(predictions){
    console.log("COCO-SSD model ready... ");
    var result = "Predictions: "

    //if there is no object predicted
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

    ImageSend(result);
}

//send the file to discord.
function ImageSend(result){
    const fileName = 'image.png'
    userImage.setFormat('png')
    userImage.write(fileName, function (err) {
        if (!err) {
            console.log("New image succefully created");
            userMessage.channel.send("```" + result + "```", { 
                files: [fileName] 
            });
        }
    })

}

//help command
function getHelp(){
    console.log("HELP");

    var help = "";

    help += " Hello there! ";
    help += "```";
    help += "\n I can help you with 10 different tasks! ";
    help += "```";
    help += "```";
    help += "\n [features #] Name.. ";
    help += "\n [0] Image Classifying ";
    help += "\n [1] Image bluring  ";
    help += "\n [2] Image resizing ";
    help += "\n [3] Image colorizing ";
    help += "\n [4] Image contrasting ";
    help += "\n [5] Image flipping ";
    help += "\n [6] Image quality ";
    help += "\n [7] Image rotation ";
    help += "\n [8] Image to Black & White ";
    help += "\n [9] Image Info ";
    help += "```";
    help += "```html";
    help += "\nCommands: ";
    help += "\n Classfy:     <Prefix> <ImageURL> <num: Feature#>";
    help += "\n Blur:        <Prefix> <ImageURL> <num: Feature#> <num: Level>";
    help += "\n resize:      <Prefix> <ImageURL> <num: Feature#> <num: width %> <num: height %>";
    help += "\n colorize:    <Prefix> <ImageURL> <num: Feature#> <num: red> <num: green> <num: blue>";
    help += "\n contrast:    <Prefix> <ImageURL> <num: Feature#> <num: +/- level> ";
    help += "\n flip:        <Prefix> <ImageURL> <num: Feature#> <char: side x/y/xy> ";
    help += "\n quality:     <Prefix> <ImageURL> <num: Feature#> <num: level 0-100> ";
    help += "\n rotate:      <Prefix> <ImageURL> <num: Feature#> <num: degree> ";
    help += "\n Black/white: <Prefix> <ImageURL> <num: Feature#> ";
    help += "\n Info:        <Prefix> <ImageURL> ";
    help += "\n Help:        <Prefix> help ";
    help += "```";
    help += "```";
    help += "example:";
    help += "\n Classfy:                       " + PREFIX + " https://i.insider.com/536aa78069bedddb13c60c3a?width=600&format=jpeg&auto=webp 0";
    help += "\n Flip the image x and y axis:   " + PREFIX + " https://i.insider.com/536aa78069bedddb13c60c3a?width=600&format=jpeg&auto=webp 5 xy";
    help += "\n Colorize the image with red:   " + PREFIX + " https://i.insider.com/536aa78069bedddb13c60c3a?width=600&format=jpeg&auto=webp 3 255 0 0";
    help += "```";

    userMessage.reply(help);
}

//emojis
function getemoji(emoji){// /* means that the emoji is not really that accurate.
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
