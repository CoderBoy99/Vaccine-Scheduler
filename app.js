const cron = require("node-cron");
const express = require("express");
const app = express();
const { MailList } = require("./model");
const {getVaccineData} = require('./getVaccineData'); 
const {sendMail} = require('./sendMail')
const {saveToDatabase} = require('./saveToDatabase')
const {getDataFromDatabase} = require('./getDataFromDatabase')
const { getHtmlTemplate } = require("./getHtmlTemplate");

let port = process.env.PORT;

if (port == null || port == "") {
  port = 3000;
}

app.set('view engine','ejs')



app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.get("/", (req, res) => {
  res.render('index');
});


app.get("/unsubscribe",(req,res) => {
    res.render("unsubscribe");
});

app.get('/about',(req,res)=>{
  res.render('about')
})


app.get('/error',(req,res)=>{
  res.render('error')
})


app.post("/submit", async (req, res) => {
  const email = req.body.email;
  const city_id = req.body.city_id;
  const vaccine_name = req.body.vaccine_name;
  const vaccineData = getVaccineData(city_id, vaccine_name);
  vaccineData.then(async (vaccineData) => {
    const noOfFree = vaccineData["free"];
    const noOfPaid = vaccineData["paid"];
    const hospitalNames = vaccineData["hospitalNames"];
    const htmlTemplate = getHtmlTemplate(
      noOfFree,
      noOfPaid,
      hospitalNames,
      vaccine_name
    );

    sendMail(email, htmlTemplate)
      .then((result) => console.log(result))
      .catch((error) => console.log(error.message));
  });

  saveToDatabase(email, city_id, vaccine_name);

  return res.redirect("/");
});

app.post("/delete", (req, res) => {
  const email = req.body.email;
  MailList.findOneAndDelete({ mail: email }, function (err, docs) {
    if (err) {
      return res.redirect('/error')
    } else {
      console.log("deleted User : "+docs)
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


app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
