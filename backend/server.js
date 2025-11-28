const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const onnx = require('onnxruntime-node');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thermal_rgb';


const app = express();
app.use(express.json());

mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(err => console.error("❌ MongoDB connection error:", err));
app.use(cors({
    origin: [
        'https://thermal-rgb.vercel.app',
        'http://localhost:5173',
        'http://localhost:3000'
    ],
    credentials: true
}));

const userRouter = require("./router/router");
app.use("/api/auth", userRouter);


// --- CONFIGURATION ---
const PATH_THERMAL_TO_RGB = path.join(__dirname, '../model_weights/thermal_gan.onnx');
const PATH_RGB_TO_THERMAL = path.join(__dirname, '../model_weights/rgbToThermalGan.onnx');

let sessionT2R = null; // Thermal -> RGB
let sessionR2T = null; // RGB -> Thermal

// --- LOAD MODELS ON STARTUP ---
async function loadModels() {
    try {
        console.log("🔄 Loading Models...");

        // Load Thermal -> RGB
        if (fs.existsSync(PATH_THERMAL_TO_RGB)) {
            sessionT2R = await onnx.InferenceSession.create(PATH_THERMAL_TO_RGB);
            console.log(`✅ Loaded: Thermal -> RGB (Input: ${sessionT2R.inputNames[0]})`);
        } else {
            console.error(`❌ Missing: ${PATH_THERMAL_TO_RGB}`);
        }

        // Load RGB -> Thermal
        if (fs.existsSync(PATH_RGB_TO_THERMAL)) {
            sessionR2T = await onnx.InferenceSession.create(PATH_RGB_TO_THERMAL);
            console.log(`✅ Loaded: RGB -> Thermal (Input: ${sessionR2T.inputNames[0]})`);
        } else {
            console.error(`❌ Missing: ${PATH_RGB_TO_THERMAL}`);
        }

    } catch (e) {
        console.error("❌ Critical Error loading models:", e);
    }
}
loadModels();

const upload = multer({ storage: multer.memoryStorage() });

// --- HELPER: NORMALIZE & INTERLEAVE ---
function prepareTensor(data, width, height, channels) {
    const size = width * height;
    const float32Data = new Float32Array(channels * size);

    if (channels === 1) {
        for (let i = 0; i < size; i++) {
            float32Data[i] = (data[i] / 255.0 - 0.5) / 0.5;
        }
    }
    else if (channels === 3) {
        for (let i = 0; i < size; i++) {
            float32Data[i] = (data[i * 3] / 255.0 - 0.5) / 0.5;
            float32Data[i + size] = (data[i * 3 + 1] / 255.0 - 0.5) / 0.5;
            float32Data[i + size * 2] = (data[i * 3 + 2] / 255.0 - 0.5) / 0.5;
        }
    }
    return new onnx.Tensor('float32', float32Data, [1, channels, height, width]);
}

// --- ROUTE 1: THERMAL TO RGB ---
app.post(['/generate', '/thermal-to-rgb'], upload.single('file'), async (req, res) => {
    if (!sessionT2R) return res.status(503).send("Model not ready.");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
        const { data } = await sharp(req.file.buffer)
            .resize(256, 256, { fit: 'fill' })
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const inputTensor = prepareTensor(data, 256, 256, 1);

        // FIX: Dynamically get the input name the model expects
        const inputName = sessionT2R.inputNames[0];
        const feeds = { [inputName]: inputTensor };

        const results = await sessionT2R.run(feeds);
        const outputData = results[Object.keys(results)[0]].data;

        // Postprocess...
        const size = 256 * 256;
        const rgbBuffer = Buffer.alloc(size * 3);
        for (let i = 0; i < size; i++) {
            let r = (outputData[i] * 0.5 + 0.5) * 255;
            let g = (outputData[i + size] * 0.5 + 0.5) * 255;
            let b = (outputData[i + size * 2] * 0.5 + 0.5) * 255;
            rgbBuffer[i * 3] = Math.max(0, Math.min(255, r));
            rgbBuffer[i * 3 + 1] = Math.max(0, Math.min(255, g));
            rgbBuffer[i * 3 + 2] = Math.max(0, Math.min(255, b));
        }

        const finalImage = await sharp(rgbBuffer, {
            raw: { width: 256, height: 256, channels: 3 }
        }).png().toBuffer();

        res.type('image/png').send(finalImage);

    } catch (err) {
        console.error("Error in T2R:", err);
        res.status(500).send("Processing Error");
    }
});

// --- ROUTE 2: RGB TO THERMAL ---
app.post('/rgb-to-thermal', upload.single('file'), async (req, res) => {
    if (!sessionR2T) return res.status(503).send("Model not ready.");
    if (!req.file) return res.status(400).send("No file uploaded");

    try {
        const { data } = await sharp(req.file.buffer)
            .resize(256, 256, { fit: 'fill' })
            .removeAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        const inputTensor = prepareTensor(data, 256, 256, 3);

        // FIX: Dynamically get the input name (likely 'rgb_input')
        const inputName = sessionR2T.inputNames[0];
        const feeds = { [inputName]: inputTensor };

        const results = await sessionR2T.run(feeds);
        const outputData = results[Object.keys(results)[0]].data;

        // Postprocess...
        const size = 256 * 256;
        const grayBuffer = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
            let val = (outputData[i] * 0.5 + 0.5) * 255;
            grayBuffer[i] = Math.max(0, Math.min(255, val));
        }

        const finalImage = await sharp(grayBuffer, {
            raw: { width: 256, height: 256, channels: 1 }
        }).png().toBuffer();

        res.type('image/png').send(finalImage);

    } catch (err) {
        console.error("Error in R2T:", err);
        res.status(500).send(err.message);
    }
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: "File upload error", detail: err.message });
    }

    console.error("Unhandled error:", err);
    res
        .status(500)
        .json({ message: "Internal server error", detail: process.env.NODE_ENV === "development" ? err.message : undefined });
});

app.listen(8000, '0.0.0.0', () => console.log("🚀 Node.js Server running on port 8000"));