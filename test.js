const axios = require('axios');
const fs = require('fs');

async function postShowModel() {
    try {
        const response = await axios({
            method: 'post',
            url: 'http://localhost:11434/v1/chat/completions',
            data: {
                model: "qwen2.5-coder:0.5b",
                messages: [
                    {
                        role: "user",
                        content: "Hello dude"
                    }
                ],
                stream: true
            },
            responseType: 'stream',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const writeStream = fs.createWriteStream('output.txt', { flags: 'w', encoding: 'utf8' });
        console.log("📡 Yanıt geliyo:");

        response.data.on('data', chunk => {
            writeStream.write(chunk+"\n");
        });

        response.data.on('end', () => {
            writeStream.end();
            console.log('\n✅ Stream bitti, dosyaya yazıldı.');
        });

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
    }
}

postShowModel();
