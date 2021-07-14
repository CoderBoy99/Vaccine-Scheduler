const getHtmlTemplate = (noOfFree, noOfPaid, hospitalNames, vaccine_name) => {
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

module.exports = { getHtmlTemplate };