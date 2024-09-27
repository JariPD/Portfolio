fetch('header.html')
  .then(response => response.text())
  .then(data => {
    // Insert the loaded header into the placeholder
    document.getElementById('header').innerHTML = data;

    // Now that the header is loaded, add the event listener for the hamburger menu
    document.getElementById('hamburger').addEventListener('click', function() {
      document.querySelector('.nav-links').classList.toggle('active');
    });
  });
  
//Automatically upate age
var dob = new Date("06/20/2004");
var month_diff = Date.now() - dob.getTime();
var age_dt = new Date(month_diff);
var year = age_dt.getUTCFullYear();
var age = Math.abs(year - 1970)
document.getElementById("age").innerHTML = age;