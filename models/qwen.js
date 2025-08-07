const setTimeout = require('timers/promises').setTimeout;

module.exports = {
  "genericName": "Android",  //Example: "Qwen"
  "name": "AndroidProMax",   //Example: "qwen2-2b",
  "license": "Apache-2.0",   //NOT REQUIRED
  "gerenicPromt": "You are a helpful assistant.", //NOT REQUIRED
  "parameter_size": "3B", //NOT REQUIRED
  "chat": async function(Chat, Lastmsg, Messages, options) {
    Chat("Selam ")
    await setTimeout(1000); // Simulate processing delay
    Chat("Nasılsın?"); // Respond to the user
    console.log(Lastmsg)
  }
}