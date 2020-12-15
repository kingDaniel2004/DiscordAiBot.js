
const { createCanvas, loadImage } = require('canvas')


const imagemin = require("imagemin");
const imageminMozjpeg = require("imagemin-mozjpeg");


var Jimp = require('jimp');
 

var open = require('open');


//var url = 'https://i.imgur.com/wCsQLGC.png'
var url = 'https://image.freepik.com/free-vector/group-animals-farm-characters_18591-63327.jpg'


//compress(url);

    loadImage(url).then((image) => {

        const canvas = createCanvas(256, 256)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(image, 0, 0, 256, 256)

        //console.log('<img src="' + canvas.toDataURL() + '" />')
        open(canvas.toDataURL(), {app: 'firefox'});
    })




async function compress(img){
    return await Jimp.read(img)
    .then(lenna => {
        return lenna
        .resize(256, 256) // resize
        .write('image.jpg'); // save
    })
    .catch(err => {
        console.error(err);
    });
}


