

const getDataFromDatabase = async () => {
  const result = await MailList.find();
  var data = [];
  for (var i = 0; i < result.length; i++) {
    const userData = {
      email: result[i]["mail"],
      city_id: result[i]["city_id"],
      vaccine_name: result[i]["vaccineName"],
    };
    data.push(userData);
  }
  return data;
};

module.exports = {getDataFromDatabase};