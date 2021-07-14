const { MailList } = require("./model");

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

module.exports = { saveToDatabase };
