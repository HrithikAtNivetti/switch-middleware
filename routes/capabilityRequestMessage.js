const convert = require("xml-js");
var storedXML = require("../utils/utils");
var axiosInstance = require("../utils/axios");
var crypto = require("crypto");
var express = require("express");
var router = express.Router();

router.post("/", function (req, res, next) {
  handleXMLAuthCall(req, res);
});

async function handleXMLAuthCall(req = {}, res = {}) {
  console.log("API - Hello There", req.body);
  let interceptorCounter;
  let { email, password, ipaddress } = req.body;
  let axios = axiosInstance(ipaddress);

  try {
    //First Request Interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "capabilityRequestMessage";
      return config;
    });

    console.log("First Interceptor Request Handler", interceptorCounter);

    // First Request Call
    const firstRequest = await axios.request("/web-services/operation", {
      data: storedXML("capabilityRequestMessage"),
    });

    // Ejecting the first interceptor
    axios.interceptors.request.eject(interceptorCounter);

    //Second Request Interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "authRequestRequestMessage";
      return config;
    });

    console.log("Second Interceptor Request Handler", interceptorCounter);

    // Second Request Call
    const secRequest = await axios.request("/web-services/operation", {
      data: storedXML("authRequestRequestMessage", email),
    });

    let secSoapResponse = await JSON.parse(
      convert.xml2json(secRequest.data, {
        compact: true,
        spaces: 2,
      })
    );

    // Ejecting the second interceptor
    axios.interceptors.request.eject(interceptorCounter);

    //third interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "authChallengeRequestRequestMessage";
      return config;
    });

    console.log("Third Interceptor Request Handler", interceptorCounter);

    let nonce = await secSoapResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
      .authChallengeResponseMessage.nonce._text;
    var name = `${email}${password}${nonce}`;
    console.log("Name Generated", email, password, nonce);
    var hash = crypto.createHash("md5").update(name).digest("hex");

    // third request call
    const thirdRequest = await axios.request("/web-services/operation", {
      data: storedXML("authChallengeRequestRequestMessage", email, nonce, hash),
    });

    let thirdSOAPResponse = JSON.parse(
      convert.xml2json(thirdRequest.data, {
        compact: true,
        spaces: 2,
      })
    );

    axios.interceptors.request.eject(interceptorCounter);
    if (
      thirdSOAPResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
        .authResultResponseMessage.status._text === "authentication-success"
    ) {
      return res.status(200).json({ message: thirdSOAPResponse, status: 200 });
    } else {
      return res
        .status(400)
        .json({
          message:
            thirdSOAPResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
              .authResultResponseMessage.status._text,
          status: 400,
        });
    }
  } catch (err) {
    axios.interceptors.request.eject(interceptorCounter);
    console.log("Error", err.message);
    if (err.message) {
      return res.status(400).json({ message: err.message, status: 400 });
    } else {
      let errorResponse = JSON.parse(
        convert.xml2json(err.response.data, {
          compact: true,
          spaces: 2,
        })
      );
      let errorMessage =
        errorResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"]
          .faultstring._text;
      return res
        .status(err.response.status)
        .json({ message: errorMessage, status: err.response.status });
    }
  }
}

module.exports = router;
