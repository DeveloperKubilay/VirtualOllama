const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 11434;

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
            "general.parameter_count": Number(model.parameter_size.toLowerCase().split('b')[0])* 1000000000,
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


app.get('/api/tags', (req, res) => {
    const ListModels = models.map(model => model.modelData);
    res.json({ models: ListModels });
});

app.post("/api/show", (req, res) => {
    const modelName = req.body.model;
    const model = models.find(m => m.modelData.name === modelName);
    if (!model) return res.status(404).json({ error: 'Model bulunamadı' });
    res.json(model.modelInfo);
});

app.post("/v1/chat/completions", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    fs.writeFileSync("test.json", JSON.stringify(req.body, null, 2));    
    console.log(req.model)

    const baseChunk = {
        id: "chatcmpl-564",
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "qwen2.5-coder:0.5b",
        system_fingerprint: "fp_ollama"
    };


    function sendChunk(fullText, cb) {
        const words = fullText.match(/\S+|\s+/g); // kelimeleri ve boşlukları koru
        let i = 0;

        function sendNext() {
            if (i >= words.length) {
                if (cb) cb(); // cümle bittiğinde callback çağrılır
                return;
            }
            const chunk = {
                ...baseChunk,
                choices: [{
                    index: 0,
                    delta: { role: "assistant", content: words[i] },
                    finish_reason: null
                }]
            };
            res.write(`data: ${JSON.stringify(chunk)}\n\n`);
            i++;
            setTimeout(sendNext, 150); // hız ayarı burada, 150ms
        }
        sendNext();
    }

    // Fonksiyonları zincirleyerek çağırıyoruz ki sırasıyla gelsinler
    sendChunk("Merhaba ben Kub ", () => {
        sendChunk("Nasıl yardımcı olabilirim", () => {
            sendChunk("?", () => {
                // Bittiğinde final chunk ve DONE
                const doneChunk = {
                    ...baseChunk,
                    choices: [{
                        index: 0,
                        delta: { role: "assistant", content: "" },
                        finish_reason: "stop"
                    }]
                };
                res.write(`data: ${JSON.stringify(doneChunk)}\n\n`);
                res.write(`data: [DONE]\n\n`);
                res.end();
            });
        });
    });

});



app.get('/', (req, res) => {
    res.send('Developed by Kubilay');
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});