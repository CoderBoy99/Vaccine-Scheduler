const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "";
const CLIENT_SECERT = "";
const REDIRECT_URL = "";
const REFRESH_TOKEN =
  "";

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECERT,
  REFRESH_TOKEN
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(emailAddress, htmlTemplate) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECERT,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "",
      to: emailAddress,
      subject: "Vaccine Notification",
      html: htmlTemplate,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

module.exports = { sendMail };
