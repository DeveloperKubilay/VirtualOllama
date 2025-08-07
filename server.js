const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 11434;

app.use(cors());
app.use(express.json());
const models = [];

fs.readdirSync('./models').forEach(file => {
    const model = require(`./models/${file}`);
    model.FileName = file;
    models.push(model);
});

app.use((req, res, next) => {
    console.log(`Gelen event: ${req.method} ${req.originalUrl}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});


// /api/tags endpoint'i output.json dosyasını döndürür
app.get('/api/tags', (req, res) => {
    try {
        const ListModels = models.map(model => model.modelData);
        res.json({ models: ListModels });
    } catch (error) {
        res.status(500).json({ error: 'output.json okunamadı.' });
    }
});

app.post("/api/show", (req, res) => {
    try {
        const modelName = req.body.model;
        console.log('Aranan model:', modelName);
        const model = models.find(m => m.modelData.name === modelName);
        if (!model) {
            console.log('Model bulunamadı:', modelName);
            return res.status(404).json({ error: 'Model bulunamadı.' });
        }
        console.log('Model bulundu, modelInfo gönderiliyor...');
        res.json(model.modelInfo);
    } catch (error) {
        console.error('API show hatası:', error);
        res.status(500).json({ error: 'İç sunucu hatası: ' + error.message });
    }
});

app.post("/v1/chat/completions", async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const baseChunk = {
        id: "chatcmpl-564",
        object: "chat.completion.chunk",
        created: Math.floor(Date.now() / 1000),
        model: "qwen2.5-coder:0.5b",
        system_fingerprint: "fp_ollama"
    };

    // Burada sendChunk fonksiyonu cümleyi parçalara ayırıp (örnek olarak kelimelere)
    // arada gecikmeyle tek tek yolluyor
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



// Basit ana sayfa
app.get('/', (req, res) => {
    res.send('Ollama REST API Simülasyonu çalışıyor!');
});

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});