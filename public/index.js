var statesOptions;
$(document).ready(function () {
  $.getJSON(
    "https://cdn-api.co-vin.in/api/v2/admin/location/states",
    function (data) {
      $.each(data["states"], function (index, states) {
        const id = states["state_id"];
        const state_name = states["state_name"];
        // console.log(states['state_id']+" "+states['state_name'])
        statesOptions += `<option value=${id}>${state_name}</option>`;
      });
      //  console.log(statesOptions);
      statesOptions =
        "<option hidden disabled selected value> -- Select state -- </option>" +
        statesOptions;
      $("#states_options").html(statesOptions);
    }
  );
});

var cityOptions;
$("#states_options").change(function () {
  const city_id = $(this).val();
  $.getJSON(
    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${city_id}`,
    function (data) {
      $.each(data["districts"], function (index, cities) {
        const id = cities["district_id"];
        const district_name = cities["district_name"];
        // console.log(states['state_id']+" "+states['state_name'])
        cityOptions += `<option value=${id}>${district_name}</option>`;
      });
      //  console.log(statesOptions);
      cityOptions =
        "<option hidden disabled selected value> -- Select city -- </option>" +
        cityOptions;
      $("#city_options").html(cityOptions);
    }
  );
});


// -----------------------------------------------------------------------------------------------------------------------
