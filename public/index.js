var statesOptions;
$(document).ready(function () {
  $.getJSON(
    "https://cdn-api.co-vin.in/api/v2/admin/location/states",
    function (data) {
      $.each(data["states"], function (index, states) {
        const id = states["state_id"];
        const state_name = states["state_name"];
        statesOptions += `<option value=${id}>${state_name}</option>`;
      });
      statesOptions =
        "<option hidden disabled selected value> -- Select state -- </option>" +
        statesOptions;
      $("#states_options").html(statesOptions);
    }
  );
});

var cityOptions;
$("#states_options").change(function () {
  const state_id = $(this).val();
  console.log(state_id)
  cityOptions = ""
  $.getJSON(
    `https://cdn-api.co-vin.in/api/v2/admin/location/districts/${state_id}`,
    function (data) {
      $.each(data["districts"], function (index, cities) {
        const id = cities["district_id"];
        const district_name = cities["district_name"];
        cityOptions += `<option value=${id}>${district_name}</option>`;
      });
      cityOptions =
        "<option hidden disabled selected value> -- Select city -- </option>" +
        cityOptions;
      $("#city_options").html(cityOptions);
    }
  );
});


// -----------------------------------------------------------------------------------------------------------------------
