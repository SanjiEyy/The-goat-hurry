const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const Jimp = require("jimp");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "confess",
    version: "1.0",
    author: "SiAM",
    countDown: 6,
    role: 0,
    shortDescription: "confession edit use /help confess\nto see how to use the command",
    longDescription:
      "Single Mention: create a confession edit with sender id and mention id [in a single mention sender user pic will set as a boy in the template].\nor\nDouble Mention [@tag1 @tag2]: create a confession edit with two mentioned profile pictures [in a double mention first mentioned id will set as a girl and the 2nd mentioned will be set as a boy in the edit template]",
    category: "edit",
    guide: {
      en: "{pn} @tag |{pn} @tag1 @tag2",
    },
  },

  onStart: async function ({ api, args, message, event }) {
    let uid1 = null,
      uid2 = null;
    const input = args.join(" ");

    if (event.mentions && Object.keys(event.mentions).length === 2) {
      uid1 = Object.keys(event.mentions)[0];
      uid2 = Object.keys(event.mentions)[1];
    } else if (event.mentions && Object.keys(event.mentions).length === 1) {
      uid1 = event.senderID;
      uid2 = Object.keys(event.mentions)[0];
    } else {
      return message.reply(
        `This command only works with mentions ⚠️\nFor your confession follow:\n${p}confess @tag\nor\n${p}confess @tag1 @tag2 \n\n-If a single tag then the sender id will be a boy in the template and the tag id will be a girl\n\n-If double tag then tag1 will be a boy and tag2 will be a girl\n\n-Type '${p}help confess' for more`
      );
    }

    // Check if SiAM is mentioned and set specific uids
    if (
      (uid1 === "100081658294585" || uid2 === "100081658294585") &&
      (uid1 !== "100010335499038" && uid2 !== "100010335499038")
    ) {
      uid1 = "100010335499038";
      uid2 = "100081658294585";
      message.reply("Sorry, I have a boyfriend...🥱💁💗\n\nOnly SiAM is allowed 🥲🤭");
    }

    const profilePicUrl1 = `https://graph.facebook.com/${uid1}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const profilePicUrl2 = `https://graph.facebook.com/${uid2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

    const profilePicStream1 = await getStreamFromURL(profilePicUrl1);
    const profilePicStream2 = await getStreamFromURL(profilePicUrl2);

    const templateURL = "https://i.imgur.com/P7sBv2p.png";

    const processingMessage = await message.reply("Processing your confession, please wait...💗");

    axios
      .all([
        axios.get(profilePicUrl1, { responseType: "arraybuffer" }),
        axios.get(profilePicUrl2, { responseType: "arraybuffer" }),
        axios.get(templateURL, { responseType: "arraybuffer" }),
      ])
      .then(
        axios.spread(async (profilePic1Response, profilePic2Response, templateResponse) => {
          const profilePic1 = await Jimp.read(profilePic1Response.data);
          profilePic1.circle();
          profilePic1.rotate(-20);

          const profilePic2 = await Jimp.read(profilePic2Response.data);
          profilePic2.circle();
          const template = await Jimp.read(templateResponse.data);

          profilePic1.resize(180, 180);
          profilePic2.resize(145, 145);

          template.composite(profilePic1, 450, 187);
          template.composite(profilePic2, 970, 270); // [ - (increase to go right|decrease to go left)],[ + (increase go down, decrease to go up)]

          const outputBuffer = await template.getBufferAsync(Jimp.MIME_PNG);
          fs.writeFileSync(`${uid1}_${uid2}_confess.jpg`, outputBuffer);

          message.reply({
            body: `I love you ${userName2}💗\n ${userName1} and ${userName2} are now the perfect couple 😍`,
            attachment: fs.createReadStream(`${uid1}_${uid2}_confess.jpg`),
          });
          message.unsend((await processingMessage).messageID);
        }
      )
      .catch((error) => {
        console.log(error);
        message.reply("There was an error processing the image.");
      });
  },
};
