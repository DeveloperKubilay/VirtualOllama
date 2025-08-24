const setTimeout = require('timers/promises').setTimeout;

let test = 0;

module.exports = {
  "genericName": "Android",  //Example: "Qwen"
  "name": "AndroidProMax",   //Example: "qwen2-2b",
  "license": "Apache-2.0",   //NOT REQUIRED
  "parameter_size": "3B",    //NOT REQUIRED
  "chat": async function (Chat, Lastmsg, Messages, options) {
    Chat("TEST")
    await setTimeout(1000); // Simulate processing delay (not needed)
    if (!test++) {
      Chat("", {
        "name": "insert_edit_into_file",
        "explanation": "test.js dosyasına Merhaba Dünya yazdıran kod eklendi.",
        "filePath": "C:\\Users\\kubil\\Desktop\\VirtualOllama\\dev\\test.js",
        "code": "console.log(\"Merhaba Dünya\");"
      });
    }
  }


  // console.log(Lastmsg)
}