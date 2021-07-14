const axios = require("axios");
const moment = require("moment");

const date = moment().format("DD-MM-YYYY");

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

module.exports = { getVaccineData };
