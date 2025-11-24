const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const onnx = require('onnxruntime-node');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// --- CONFIGURATION ---
const MODEL_PATH = path.join(__dirname, '../model_weights/thermal_gan.onnx'); // Point to your ONNX file
let session = null;

// --- LOAD MODEL ON STARTUP ---
async function loadModel() {
    try {
        console.log("Loading 500MB ONNX Model... Please wait.");
        // We load the model into memory once
        session = await onnx.InferenceSession.create(MODEL_PATH);
        console.log("✅ Model Loaded Successfully!");
    } catch (e) {
        console.error("❌ Failed to load model:", e);
    }
}
loadModel();

// --- UPLOAD HANDLING ---
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.json({
        message: `the server is active and running!`
    })
})

app.post('/generate', upload.single('file'), async (req, res) => {
    if (!session) return res.status(503).send("Model is still loading...");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
        // 1. PREPROCESS IMAGE (Using Sharp)
        // Resize to 256x256, Convert to Grayscale, Get Raw Pixel Data
        const { data, info } = await sharp(req.file.buffer)
            .resize(256, 256, { fit: 'fill' })
            .grayscale() // Ensure 1 Channel
            .raw()
            .toBuffer({ resolveWithObject: true });

        // 2. NORMALIZE & CREATE TENSOR
        // Map 0-255 pixels to [-1, 1] range (Mean 0.5, Std 0.5)
        const float32Data = new Float32Array(256 * 256);
        for (let i = 0; i < data.length; i++) {
            float32Data[i] = (data[i] / 255.0 - 0.5) / 0.5;
        }

        // Create ONNX Tensor (Batch:1, Channel:1, H:256, W:256)
        const inputTensor = new onnx.Tensor('float32', float32Data, [1, 1, 256, 256]);

        // 3. RUN INFERENCE
        const feeds = { input: inputTensor }; // 'input' matches the name in export script
        const results = await session.run(feeds);
        const outputData = results.output.data; // Float32Array output

        // 4. POSTPROCESS (Tensor -> RGB Image)
        // Output is [1, 3, 256, 256]. We need to interleave it to [256, 256, 3] for Sharp
        const rgbBuffer = Buffer.alloc(256 * 256 * 3);
        
        for (let i = 0; i < 256 * 256; i++) {
            // Inverse Normalize: (x * 0.5) + 0.5 -> Map [-1, 1] back to [0, 1] -> * 255
            let r = (outputData[i] * 0.5 + 0.5) * 255;
            let g = (outputData[i + 256 * 256] * 0.5 + 0.5) * 255;
            let b = (outputData[i + 256 * 256 * 2] * 0.5 + 0.5) * 255;

            // Clamp values
            rgbBuffer[i * 3] = Math.max(0, Math.min(255, r));
            rgbBuffer[i * 3 + 1] = Math.max(0, Math.min(255, g));
            rgbBuffer[i * 3 + 2] = Math.max(0, Math.min(255, b));
        }

        // 5. SEND BACK AS PNG
        const finalImage = await sharp(rgbBuffer, {
            raw: { width: 256, height: 256, channels: 3 }
        }).png().toBuffer();

        res.type('image/png').send(finalImage);

    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing image");
    }
});

// Start Server
app.listen(8000, () => console.log("🚀 Node.js Server running on port 8000"));