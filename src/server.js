const tf = require('@tensorflow/tfjs')
// Load the binding (CPU computation)
const mobilenet = require('@tensorflow-models/mobilenet');

// for getting the data images
var image = require('get-image-data')

var url = 'https://png.pngtree.com/png-clipart/20190903/original/pngtree-small-url-icon-opened-on-the-computer-png-image_4424025.jpg';
image(url, async function (err, image) {

    const numChannels = 3;
    const numPixels = image.width * image.height;
    const values = new Int32Array(numPixels * numChannels);
    pixels = image.dat
    for (let i = 0; i < numPixels; i++) {
        for (let channel = 0; channel < numChannels; ++channel) {
            values[i * numChannels + channel] = pixels[i * 4 + channel];
        }
    }
    const outShape = [image.height, image.width, numChannels];
    const input = tf.tensor3d(values, outShape, 'int32');
    await load(input)
});

async function load(img){
    // Load the model.
    const model = await mobilenet.load();

    // Classify the image.
    const predictions = await model.classify(img);

    console.log('Predictions: ');
    console.log(predictions);
}
