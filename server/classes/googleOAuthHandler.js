const OAuth = require("../google/oauth");

class OAuthObject {
  constructor() {
    this.authClient = null;
    this.userInfo = null;
  }

  /**
   * starts the process by signing in
   * @param { string } code
   * @returns returns user information
   */
  initialize = async (code) => {
    this.authClient = await OAuth.createClient();
    // Get access and refresh token
    await OAuth.setToken(this.authClient, code);
    // Get user info given their current OAuth creds
    let info = await OAuth.getUserInfo(this.authClient);
    this.userInfo = info.data;
    return info;
  };

  getInfo = () => {
    return this.userInfo;
  };

  getClient = () => {
    return this.authClient;
  };
}

let OAuthObjectStore = {
  clients: {},
  main: null,
};

OAuthObjectStore.setMain = async () => {
  let mainClient = await OAuth.createMain();
  OAuthObjectStore["main"] = mainClient;
};

/**
 * gets the client object
 * @param { string } clientEmail
 * @returns oauth client object
 */
OAuthObjectStore.getClient = (clientEmail) => {
  let authObject = OAuthObjectStore.clients[clientEmail];
  if (authObject) {
    return OAuthObjectStore.clients[clientEmail].getClient();
  } else {
    return undefined;
  }
};

OAuthObjectStore.addClient = async (authClient) => {
  let clientInfo = authClient.getInfo();
  let clientEmail = clientInfo.email;

  if (clientEmail in OAuthObjectStore.clients) {
    return OAuthObjectStore.clients[clientEmail];
  }

  OAuthObjectStore.clients[clientEmail] = authClient;
};

OAuthObjectStore.removeClient = async (authClient) => {
  let clientInfo = authClient.getInfo();
  let clientEmail = clientInfo.email;

  if (clientEmail in OAuthObjectStore.clients) {
    delete OAuthObjectStore.clients[clientEmail];
  }
};

OAuthObjectStore.getMain = () => {
  return OAuthObjectStore.main;
};

module.exports = { OAuthObject, OAuthObjectStore };
