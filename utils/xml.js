const lockHandlerXML = (name, lockType = "") => {
  switch (name) {
    case "getConfigLockRequestMessage":
      return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ><soap:Body><getConfigLock:getConfigLockRequestMessage xmlns:getConfigLock = "http://www.nivettisystems.com/webservice/configuration/getConfigLockRequestMessage"><lockType>${lockType}</lockType></getConfigLock:getConfigLockRequestMessage></soap:Body></soap:Envelope>`;
    case "releaseConfigLockRequestMessage":
      return `<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ><soap:Body><releaseConfigLock:releaseConfigLockRequestMessage xmlns:releaseConfigLock = "http://www.nivettisystems.com/webservice/configuration/releaseConfigLockRequestMessage"></releaseConfigLock:releaseConfigLockRequestMessage></soap:Body></soap:Envelope>`;
    default:
      break;
  }
};

module.exports = { lockHandlerXML };
