const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const CLIENT_ID =
  "10266227280-gck8taackqgu416nd3pirnqsak10vma8.apps.googleusercontent.com";
const CLIENT_SECERT = "GqrlUL571_Um0D9jQYIIHeJ0";
const REDIRECT_URL = "https://developers.google.com/oauthplayground";
const REFRESH_TOKEN =
  "1//04hpf0g2RI9HlCgYIARAAGAQSNwF-L9Ir0miz7gpFj8XsWcImDwXxxa40McmUjO6y244goTbdQooDfhCztpdD8dBWwhIPC41OlJg";

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
        user: "abhinavkushwah7@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECERT,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: "abhinavkushwah7@gmail.com",
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
