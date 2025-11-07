const setTimeout = require('timers/promises').setTimeout;
const axios = require("axios")

module.exports = {
    "genericName": "Heroku",  //Example: "Qwen"
    "name": "gpt-oss-120b",   //Example: "qwen2-2b",
    "license": "Apache-2.0",   //NOT REQUIRED
    "parameter_size": "3B",    //NOT REQUIRED
    "chat": async function (Chat, Lastmsg, Messages, options, Write) {

        const KEY = "KEY";
        const URL = "https://us.inference.heroku.com";

        const res = await axios.post(URL + "/v1/chat/completions", options, {
            headers: {
                Authorization: `Bearer ${KEY}`,
            },
            responseType: "stream"
        });

        for await (const chunk of res.data) {
            Write(chunk);
        }

    }
}
