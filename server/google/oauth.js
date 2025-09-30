/**
 *
 * Handles the Google-based OAuth stuff. Verifies the information provided by the user.
 *
 */

const { google } = require("googleapis");
const dotenv = require("dotenv");
const serviceAccountInfo = require("../dev_creds.json");

dotenv.config();

/**
 *
 * Creates an OAuth2Client using Google information, this is used with the user Google code
 * to get Google authentication details that can be used to interact with specified scopes.
 *
 * @return {OAuth2} Returns the newly created OAuth2 client.
 *
 */

let createClient = async () => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLEID,
    process.env.GOOGLESECRET,
    "postmessage",
  );

  return oauth2Client;
};

let createMain = async () => {
  const auth = google.auth;
  const oauth2Client = auth.fromJSON(serviceAccountInfo);
  oauth2Client.scopes = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ];

  return oauth2Client;
};

/**
 *
 * Get and set tokens for the OAuth2Client using the code returned by user.
 *
 * @param {obj} oauth2Client The user's oauth client.
 * @param {string} code Code returned by Google to user.
 *
 */

let setToken = async (oauth2Client, code) => {
  let { tokens } = await oauth2Client.getToken(code);
  await oauth2Client.setCredentials(tokens);

  //const apis = google.getSupportedAPIs();
  return;
};

/**
 *
 * Gets user info using the OAuth2Client
 *
 * @param {obj} oauth2Client The user's oauth client.
 * @return {obj} Object returned to user containing the authenticated user's info
 *
 */
let getUserInfo = async (oauth2Client) => {
  const oauth2 = google.oauth2("v2");
  // A promise is necessary here to wait for the request to be
  // returned by Google.
  return await new Promise((resolve, reject) => {
    oauth2.userinfo.get(
      {
        auth: oauth2Client,
      },
      (err, res) => {
        if (err) {
          reject({ success: false, data: err });
        } else {
          resolve({ success: true, data: res.data });
        }
      },
    );
  });
};

/**
 *
 * Decode JWT token
 *
 * @param {string} token User's token
 * @return {string} User's info
 *
 */

let decodeToken = async (token) => {
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  return decodedToken;
};

module.exports = {
  createClient,
  createMain,
  setToken,
  getUserInfo,
  decodeToken,
};
