var express = require("express");
var router = express.Router();

// Importing the Request Script
var { request } = require("../utils/request");

router.post("/", function (req, res, next) {
  handler(req, res);
});

// Request Handler
async function handler(req, res) {
  let apiResponse = await request("getSystemRequestMessage", false);
  if (apiResponse.status) {
    let responseData = await apiResponse.response;
    return res.status(200).json({
      message: await responseData["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
        .getSystemResponseMessage,
      status: true,
    });
  } else {
    return res.status(500).json({ message: apiResponse.error, status: false });
  }
}

module.exports = router;
