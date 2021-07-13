const mongoose = require("mongoose");

const DATABASE_NAME = "Mails";
const PASSWORD = "Admin";

mongoose
  .connect(
    `mongodb+srv://root:${PASSWORD}@cluster0.2ido4.mongodb.net/${DATABASE_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => console.log("Database sucessfully connected !!!"));

const mails = new mongoose.Schema({
  mail: {
    type: String,
    required: true,
    trim: true,
    match: /.+\@.+\..+/,
  },
  city_id : { type: Number, required: true, trim: true },
  vaccineName: { type: String, required: true, trim: true },
});

const MailList = new mongoose.model("MailList", mails);
module.exports = { MailList }