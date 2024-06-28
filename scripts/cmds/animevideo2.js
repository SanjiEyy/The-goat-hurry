const axios = require('axios');

module.exports = {
  config: {
    name: "animevideo2",
    aliases: [],
    version: "1.0",
    author: "hắn hành tẩu",
    countDown: 5,
    role: 0,
    shortDescription: "get manga data",
    longDescription: "search and get manga infos",
    category: "anime",
    guide: "{pn} {{<name>}}"
  },

  onStart: async function ({ message, args }) {

      const BASE_URL = `https://apivideo.nebin.repl.co/snauzk/?apikey=binee1805`;

       await message.reply("processing your video senpai....");


      try {
        let res = await axios.get(BASE_URL)




        let img =  res.data.url;

        const form = {
          body: ``
        };
      if (img)
          form.attachment = await global.utils.getStreamFromURL(img);
        message.reply(form);  
      } catch (e) { message.reply(`ðŸ¥º Not Found`)
                  console.log(e);
                  }

    }
  };