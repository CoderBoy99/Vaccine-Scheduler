const cron = require("node-cron");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const express = require("express");
const app = express();
const path = require("path");
const { MailList } = require("./model");
const axios = require("axios");
const moment = require("moment");
const port = process.env.port || 3000;

const date = moment().format("DD-MM-YYYY");

app.set('view engine','ejs')

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.get("/", (req, res) => {
  res.render('index');
});


app.get("/unsubscribe",(req,res) => {
    res.render("unsubscribe");
});

app.get('/about',(req,res)=>{
  res.render('about')
})

app.post("/submit", async(req, res) => {
  const email = req.body.email;
  const city_id = req.body.city_id;
  const vaccine_name = req.body.vaccine_name;
  // console.log(email+" "+city_id+" "+vaccine_name);
  const vaccineData = getVaccineData(city_id, vaccine_name);
  vaccineData.then(async(vaccineData) => {
    //sendMail
    const noOfFree = vaccineData["free"];
    const noOfPaid = vaccineData["paid"];
    const hospitalNames = vaccineData["hospitalNames"];
    const htmlTemplate = getHmlTemplate(
      noOfFree,
      noOfPaid,
      hospitalNames,
      vaccine_name
    );

    sendMail(email, htmlTemplate)
      .then((result) => console.log(result))
      .catch((error) => console.log(error.message));
  });

  //save to database
  saveToDatabase(email, city_id, vaccine_name);

  return res.redirect("/");
});

app.get('/error',(req,res)=>{
  res.render('error')
})

app.post("/delete", (req, res) => {
  //find that email and delete it
  const email = req.query.email;
  MailList.findOneAndDelete({ mail: email }, function (err, docs) {
    if (err) {
      return res.redirect('/error')
    } else {
      return res.redirect("/unsubscribe");
    }
  });
});

cron.schedule("* * * 1 * *", async() => {
  const UserData = await getDataFromDatabase();
  for (var i = 0; i < UserData.length; i++) {
    const city_id = UserData[i]["city_id"];
    const vaccine_name = UserData[i]["vaccine_name"];
    const email = UserData[i]["email"];
    const vaccineData = getVaccineData(city_id, vaccine_name);
    vaccineData.then((vaccineData) => {
      //sendMail
      const noOfFree = vaccineData["free"];
      const noOfPaid = vaccineData["paid"];
      const hospitalNames = vaccineData["hospitalNames"];
      const htmlTemplate = getHmlTemplate(
        noOfFree,
        noOfPaid,
        hospitalNames,
        vaccine_name
      );
      sendMail(email, htmlTemplate)
        .then((result) => console.log(result))
        .catch((error) => console.log(error.message));
    });
  }
});

const getVaccineData = async (city_id, vaccine_name) => {
  return (res = await axios
    .get(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${city_id}&date=${date}`
    )
    .then((res) => {
      const jabs = res.data["sessions"];
      var free = 0;
      var paid = 0;
      const hospitalNames = [];
      for (var i = 0; i < jabs.length; i++) {
        const jab = jabs[i];
        const hospitalName = jab["name"];
        const available_dose = jab["available_capacity"];
        const available_dose_1 = jab["available_capacity_dose1"];
        const available_dose_2 = jab["available_capacity_dose2"];
        const vaccine = jab["vaccine"];
        const free_type = jab["fee_type"];
        if (
          available_dose_1 > 0 &&
          available_dose_2 > 0 &&
          vaccine == vaccine_name
        ) {
          hospitalNames.push(hospitalName);
          if (free_type == "Free") free++;
          else paid++;
        }
      }
      return { free, paid, hospitalNames };
    }));
};

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

const saveToDatabase = async (email, city_id, vaccineName) => {
  try {
    const val = new MailList({
      mail: email,
      city_id: city_id,
      vaccineName: vaccineName,
    });

    const result = await val.save();
    // console.log(result);
  } catch (error) {
    console.log(error.message);
  }
};

const getDataFromDatabase = async () => {
  const result = await MailList.find();
  var data = [];
  for (var i = 0; i < result.length; i++) {
    const userData = {
      email: result[i]["mail"],
      city_id: result[i]['city_id'],
      vaccine_name: result[i]["vaccineName"],
    };
    data.push(userData);
  }
  return data;
};

const getHmlTemplate = (noOfFree, noOfPaid, hospitalNames, vaccine_name) => {
  var htmlTemplate;
  if (noOfFree == 0 && noOfPaid == 0)
    htmlTemplate = `<strong>Right Now, No doses of ${vaccine_name} is available in your area.<br>But will notify soon if available. </strong>`;
  else {
    htmlTemplate = `<strong>Vaccine is now available in your area at the following centers :</strong><br><br>`;
    var idx = 0;
    for (var i = 0; i < hospitalNames.length; i++) {
      idx += 1;
      htmlTemplate += `${idx}) ${hospitalNames[i]}<br>`;
    }
    htmlTemplate += `<br>Number of paid doses is <strong>${noOfPaid}</strong> & free doses available is <strong>${noOfFree}</strong> of <strong>${vaccine_name}</strong>`;
    htmlTemplate +=
      '<br><br><a href="https://selfregistration.cowin.gov.in/"><strong>Book Now</strong></a>';
  }
  htmlTemplate +=
    "<br><br><strong> Thank You for using Vaccine Scheduler&#x1F60A;</strong>";

  return htmlTemplate;
};

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
