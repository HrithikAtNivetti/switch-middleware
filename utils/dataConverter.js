// Convert xml to json
var convert = require("xml-js");

const ConvertXml2Json = async (request) => {
  let response = await JSON.parse(
    convert.xml2json(request.data, {
      compact: true,
      spaces: 2,
    })
  );

  return response;
};

const ConvertErrorXml2Json = async (error) => {
  let errorResponse = await JSON.parse(
    convert.xml2json(error.response.data, {
      compact: true,
      spaces: 2,
    })
  );

  return errorResponse;
};

module.exports = { ConvertXml2Json, ConvertErrorXml2Json };
