const fs = require("fs").promises;
const path = require("path");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
// https://developers.google.com/calendar/api/guides/overview?hl=ko
// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(__dirname, "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {Date} start Date type
 * @param {Date} end Date type.
 */
async function listEvents(auth, start, end) {
  const calendar = google.calendar({ version: "v3", auth });
  console.log(start);
  console.log(end);
  const res = await calendar.events.list({
    calendarId: "primary",
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });
  const events = res.data.items;
  if (!events || events.length === 0) {
    console.log("No upcoming events found.");
    return;
  }
  console.log("Upcoming 10 events:");
  events.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
  return events;
}

async function getAllEvents(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const allEvents = [];
  let timeMin = new Date().toISOString();
  while (1) {
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: timeMin,
      //   maxResults: 30,
      singleEvents: true,
      orderBy: "startTime",
    });
    const events = res.data.items;
    if (
      !events ||
      events.length === 0 ||
      timeMin === events[events.length - 1].start.date ||
      timeMin === events[events.length - 1].start.dateTime
    ) {
      console.log("No upcoming events found.");
      break;
    }
    allEvents.push(...events);
    timeMin =
      events[events.length - 1].start.date ||
      events[events.length - 1].start.dateTime;
  }

  allEvents.map((event, i) => {
    const start = event.start.dateTime || event.start.date;
    console.log(`${start} - ${event.summary}`);
  });
  return allEvents;
}

//get calendar id
async function calendarList(auth) {
  const calendar = google.calendar({ version: "v3", auth });
  const calendar_list = await calendar.calendarList.list();
  console.log(calendar_list.data.items);
}

// authorize().then(calendarList).catch(console.error);

module.exports = { authorize, calendarList, getAllEvents, listEvents };
