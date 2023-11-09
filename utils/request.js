// Convert xml to json
var {
  ConvertXml2Json,
  ConvertErrorXml2Json,
} = require("../utils/dataConverter");
// Axios Instance
var axiosInstance = require("../utils/axios");
// Stored XML Body
var storedXML = require("../utils/utils");
var lockHandlerXML = require("../utils/xml");
// MD5 Hash Creator
var crypto = require("crypto");

const request = async (apiHeader, lockType) => {
  // Vairables Initializer
  let interceptorCounter = 0;
  let email = "admin";
  let password = "admin";
  let ipaddress = "192.168.2.1";
  let axios = axiosInstance(ipaddress);

  try {
    /*
        Stage - 1: // Authentication Call 
    */

    //First Request Interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "capabilityRequestMessage";
      return config;
    });

    // First Request Call
    await axios.request("/web-services/operation", {
      data: storedXML("capabilityRequestMessage"),
    });

    // Ejecting the first interceptor
    axios.interceptors.request.eject(interceptorCounter);

    //Second Request Interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "authRequestRequestMessage";
      return config;
    });

    // Second Request Call
    const secRequest = await axios.request("/web-services/operation", {
      data: storedXML("authRequestRequestMessage", email),
    });

    // XML to JSON Conversion
    let secSoapResponse = await ConvertXml2Json(secRequest);

    // Ejecting the second interceptor
    axios.interceptors.request.eject(interceptorCounter);

    //third interceptor
    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = "authChallengeRequestRequestMessage";
      return config;
    });

    let nonce = await secSoapResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]
      .authChallengeResponseMessage.nonce._text;
    var name = `${email}${password}${nonce}`;
    var hash = crypto.createHash("md5").update(name).digest("hex");

    // third request call
    let authSuccess = await axios.request("/web-services/operation", {
      data: storedXML("authChallengeRequestRequestMessage", email, nonce, hash),
    });

    axios.interceptors.request.eject(interceptorCounter);

    // Need to check if the auth was success (condition)

    /*
        Stage - 2: // Acquire Read/Write Lock 
    */

    if (lockType) {
      interceptorCounter = axios.interceptors.request.use((config) => {
        config.headers["SOAPAction"] = "getConfigLockRequestMessage";
        return config;
      });

      // First Request Call
      let lockAcquire = await axios.request("/web-services/configuration", {
        data: lockHandlerXML("getConfigLockRequestMessage", lockType),
      });

      // Ejecting the first interceptor
      axios.interceptors.request.eject(interceptorCounter);

      // XML 2 JSON Conversion
      let lockResponse = ConvertXml2Json(lockAcquire);
    }

    /*
        Stage - 3: // Do The Actual API Call 
    */

    interceptorCounter = axios.interceptors.request.use((config) => {
      config.headers["SOAPAction"] = apiHeader;
      return config;
    });

    // First Request Call
    let coreApiRequest = await axios.request("/web-services/operation", {
      data: storedXML(apiHeader),
    });

    // Ejecting the first interceptor
    axios.interceptors.request.eject(interceptorCounter);

    // XML 2 JSON Conversion

    let coreApiResponse = ConvertXml2Json(coreApiRequest);

    /*
        Stage - 4: // Release Read/Write Lock 
    */

    if (lockType) {
      //First Request Interceptor
      interceptorCounter = axios.interceptors.request.use((config) => {
        config.headers["SOAPAction"] = "releaseConfigLockRequestMessage";
        return config;
      });

      // First Request Call
      let releaseLock = await axios.request("/web-services/configuration", {
        data: lockHandlerXML("releaseConfigLockRequestMessage"),
      });

      // Ejecting the first interceptor
      axios.interceptors.request.eject(interceptorCounter);
    }

    return { status: true, response: coreApiResponse };
  } catch (err) {
    axios.interceptors.request.eject(interceptorCounter);
    if (err.message) {
      return { message: err.message, status: false };
    } else {
      let errorResponse = ConvertErrorXml2Json(err);
      let errorMessage =
        errorResponse["SOAP-ENV:Envelope"]["SOAP-ENV:Body"]["SOAP-ENV:Fault"]
          .faultstring._text;
      return { status: false, error: errorMessage };
    }
  }
};

module.exports = { request };
