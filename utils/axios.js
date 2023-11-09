var axios = require("axios");
const https = require("https");

let axiosInstance = (ipaddress) =>
  axios.create({
    method: "post",
    baseURL: `https://${ipaddress}:80`,
    maxBodyLength: Infinity,
    headers: {
      "Accept-Encoding": "none",
      "Accept-Charset": "utf-8",
      Host: `${ipaddress}:80`,
      "Content-Type": "text/xml; ",
      Connection: "keep-alive",
    },
    httpsAgent: new https.Agent({
      rejectUnauthorized: false,
      maxVersion: "TLSv1.2",
      minVersion: "TLSv1.2",
      keepAlive: true,
      timeout: 2000, // 2 sec's of timeout
    }),
  });

module.exports = axiosInstance;
