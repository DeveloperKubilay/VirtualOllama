<p align="center">
	<img src="https://raw.githubusercontent.com/DeveloperKubilay/VirtualOllama/refs/heads/main/dev/image.png" alt="VirtualOllama logo" />
</p>

# VirtualOllama 🦙💻

Spin up your own AI REST API, Ollama style. Plug in any model, flex hard. No limits, just vibes. 😎🔥

## Features
- Drop any AI model in `/models`, it just works
- REST API like Ollama (but open, no gatekeeping)
- Node.js + Express, super light
- CORS ready, JSON in/out
- Custom chat logic per model (see `models/example.js`)

## Quick Start

```bash
git clone https://github.com/DeveloperKubilay/VirtualOllama.git
cd VirtualOllama
npm install
npm start
```

## API Endpoints

- `GET /api/tags` → List all models
- `POST /api/show` → Get model info (body: `{ "model": "ModelName" }`)
- `POST /v1/chat/completions` → Chat with a model (Ollama style)

## How To Add Your Model
1. Copy `models/example.js` and edit it. Change `genericName`, `name`, and your chat logic.
2. Drop it in `/models` folder. That’s it.

## Example Model (from `models/example.js`)

```js
module.exports = {
	genericName: "Android",
	name: "AndroidProMax",
	license: "Apache-2.0",
	parameter_size: "3B",
	chat: async function(Chat, Lastmsg, Messages, options) {
		Chat("TEST ");
		await setTimeout(1000);
		Chat("123!");
		console.log(Lastmsg);
	}
}
```

## Credits & Source
- Built by [Kubilay](https://github.com/DeveloperKubilay/VirtualOllama)
- Inspired by Ollama, but 100% open source
- All code: [`server.js`](./server.js), [`models/example.js`](./models/example.js), [`package.json`](./package.json)

## License
MIT. Do what you want, just don’t be evil. 