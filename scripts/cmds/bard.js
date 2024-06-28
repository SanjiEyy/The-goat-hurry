//THID COMMAND IS BARD THAT SUPPIRTS IMAGES/PICTURES

const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "bard",
    version: "1.0",
    role: 0,
    author: "AceGun",
    cooldowns: 5,
    shortdescription: "Ask",
    longdescription: "ask anything to Google bard",
    category: "ai",
    usages: "{pn} your query",
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply, body } = event;

    let question = "";

    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      const attachment = messageReply.attachments[0];
      const imageURL = attachment.url;
      question = await convertImageToText(imageURL);

      if (!question) {
        api.sendMessage("Failed to convert the photo to text. Please try again with a clearer photo.", threadID, messageID);
        return;
      }
    } else {
      question = body.slice(5).trim();

      if (!question) {
        api.sendMessage("Please provide a question or query", threadID, messageID);
        return;
      }
    }

    api.sendMessage("Searching for an answer, please wait...", threadID, messageID);

    try {
      const res = await axios.get(`https://api.heckerman06.repl.co/api/other/bard-ai69?response=${encodeURIComponent(question)}`);
      const respond = res.data.content;
      const respond2 = res.data.content2;

      if (Array.isArray(respond) && respond.length > 0) {
        const photoUrls = respond.map(item => item[0][0]);
        const attachments = [];

        if (!fs.existsSync("cache")) {
          fs.mkdirSync("cache");
        }

        for (let i = 0; i < photoUrls.length; i++) {
          const url = photoUrls[i];
          const photoPath = `cache/cat${i + 1}.png`;

          try {
            const imageResponse = await axios.get(url, { responseType: "arraybuffer" });
            fs.writeFileSync(photoPath, imageResponse.data);

            attachments.push(fs.createReadStream(photoPath));
          } catch (error) {
            console.error("Error occurred while downloading and saving the photo:", error);
          }
        }

        api.sendMessage(
          {
            attachment: attachments,
            body: respond2,
          },
          threadID,
          messageID
        );
      } else {
        api.sendMessage(respond2, threadID, messageID);
      }
    } catch (error) {
      console.error("Error occurred while fetching data from the Bard API:", error);
      api.sendMessage("An error occurred while fetching data. Please try again later.", threadID, messageID);
    }
  },
};

async function convertImageToText(imageURL) {
  const response = await axios.get(`https://api.heckerman06.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`);
  return response.data.extractedText;
}