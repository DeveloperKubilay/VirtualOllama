const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();

const PORT = process.env.PORT || 11434;
const basePath = process.env.BASEPATH ||'/';

app.use(cors());
app.use(express.json());
const models = [];

fs.readdirSync('./models').forEach(file => {
    const model = require(`./models/${file}`);
    model.FileName = file;
    model.modelData = {
        "name": model.name,
        "model": model.name,
        "modified_at": new Date().toISOString(),
        "size": 0,
        "digest": "",
        "details": {
            "parent_model": "",
            "format": "",
            "family": model.genericName,
            "families": [
                model.genericName
            ],
            "parameter_size": "",
            "quantization_level": ""
        }
    }
    model.modelInfo = {
        "license": model.license || "Unknown",
        "modelfile": "",
        "template": "",
        "system": model.gerenicPromt,
        "details": model.modelData.details,
        "model_info": {
            "general.architecture": model.genericName,
            "general.base_model.0.name": model.name,
            "general.base_model.0.organization": model.genericName,
            "general.base_model.0.repo_url": "",
            "general.base_model.count": 1,
            "general.basename": model.name,
            "general.file_type": 15,
            "general.finetune": "Instruct",
            "general.languages": null,
            "general.license": "other",
            "general.license.link": model.license,
            "general.license.name": model.license,
            "general.parameter_count": Number(model.parameter_size.toLowerCase().split('b')[0]) * 1000000000,
            "general.quantization_version": 2,
            "general.size_label": model.parameter_size.toUpperCase(),
            "general.tags": null,
            "general.type": "model",
            "tokenizer.ggml.add_bos_token": false,
            "tokenizer.ggml.bos_token_id": 151643,
            "tokenizer.ggml.eos_token_id": 151645,
            "tokenizer.ggml.merges": null,
            "tokenizer.ggml.model": "gpt2",
            "tokenizer.ggml.padding_token_id": 151643,
            "tokenizer.ggml.pre": model.genericName,
            "tokenizer.ggml.token_type": null,
            "tokenizer.ggml.tokens": null
        },
        "capabilities": [
            "completion",
            "tools",
            "insert"
        ],
        "modified_at": new Date().toISOString()
    }
    models.push(model);
});

const router = express.Router();

router.get('/api/version', (req, res) => {
    res.json({ version: "0.6.8" });
});

router.get('/api/tags', (req, res) => {
    const ListModels = models.map(model => model.modelData);
    res.json({ models: ListModels });
});

router.post("/api/show", (req, res) => {
    const modelName = req.body.model;
    const model = models.find(m => m.modelData.name === modelName);
    if (!model) return res.status(404).json({ error: 'Model bulunamadı' });
    res.json(model.modelInfo);
});

router.post("/v1/chat/completions", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const modelName = req.body.model;
    const model = models.find(m => m.modelData.name === modelName);
    if (!model) return res.status(404).json({ error: 'Model bulunamadı' });

    const baseChunk = {
        id: "chatcmpl-" + Math.floor(Math.random() * 1000000),
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: model.name,
        system_fingerprint: "fp_ollama"
    };

    async function Chat(Message, Tools) {
        if (typeof Tools === "object") Tools = [Tools];
        const chunk = {
            ...baseChunk,
            choices: [{
                index: 0,
                delta: {
                    role: "assistant",
                    content: Message,
                    tool_calls: Tools?.map((x, c) => {
                        return {
                            "id": "call_" + Math.floor(Math.random() * 1000000),
                            "index": c,
                            "type": x.OLLAMA_MODEL_DATATYPE || "function",
                            "function": {
                                "name": x.name,
                                "arguments": JSON.stringify(x || {})
                            }
                        }
                    }),
                },
                finish_reason: null
            }]
        };
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    const lastMessage = req.body.messages[req.body.messages.length - 1]?.content || "";
    const write = res.write.bind(res);
    await model.chat(Chat, lastMessage, req.body.messages, req.body, write, res);

    const doneChunk = {
        ...baseChunk,
        choices: [{
            index: 0,
            delta: { role: "assistant", content: "" },
            finish_reason: "tool_calls"
        }]
    };
    res.write(`data: ${JSON.stringify(doneChunk)}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
});

router.get('/', (req, res) => {
    res.send('Developed by Kubilay<br>https://github.com/DeveloperKubilay/VirtualOllama');
});

app.use(basePath, router);

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
