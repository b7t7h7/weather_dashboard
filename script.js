//set current date and time with moment.js
$("#currentDay").text(moment().format('MMMM Do YYYY, h:mm:ss a')); 
var currentTime = moment().format();

var searchBtnEl = document.querySelector("#searchBtn");
var cityInputEl = document.querySelector("#cityInput");
var cityArr = [];
var cityName = cityArr[0];
var queryURL = "https://api.openweathermap.org/data/2.5/forecast?id=524901&APPID=";
var apiKey = "138aff0a68fe85b05db96a1e3f435379";

$.ajax({
    url: queryURL + apiKey,
    method: "GET"
  }).then(function(response) {
      console.log("API call: " + queryURL + apiKey);
      console.log(response);
  });

  initialize();

  searchBtnEl.addEventListener("click", function(){
    console.log(cityArr);
    
    getWeather(cityInputEl.value, cityArr);
    fiveDay(cityInputEl.value);
  });

  function initialize(){
      //get cityArr from localStorage
      cityName = localStorage.getItem("cityName");
      //if cityArr is empty
      if (cityName !== null){
          cityArr[0] = cityName;
          console.log ("cityName: " + cityName);
          getWeather(cityName);
          fiveDay(cityName);
      }
      //print cityName to recent searches list
      renderButtons();
  }

  function renderButtons() {
    // Delete city btns prior to adding new city btns
    $("#buttons-view").empty();
    // Loop through cityArr
    for (var i = 0; i < cityArr.length; i++) {
      // dynamicaly generate btns for each city in cityArr
      var a = $("<button>");
      // add class to the button
      a.addClass("cityBtn");
      // data-attribute value of city at [i]
      a.attr("data-name", cityArr[i]);
      // button's text value of city at [i]
      a.text(cityArr[i]);
      // add button to the HTML
      $("#buttons-view").append(a);
      // add on-click to get weather for that city
      a.on("click", function(){
        cityInputEl.value = $(this).attr("data-name");
        getWeather($(this).attr("data-name"));
        fiveDay($(this).attr("data-name"));
      });
    }
  }

  function getWeather(cityName, cityArr){
    var weatherByCityURL = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + apiKey;
    console.log("currentWeather: " + weatherByCityURL);

    // api call for current weather of city
    $.ajax({
        url: weatherByCityURL,
        method: "GET"
      }).fail(function() {
        alert("Please enter a valid city name.");
      }).success(function(response) {
          console.log(response);

          if (cityArr !== undefined) {
            cityArr.unshift(cityName);
            console.log(cityArr);
            localStorage.setItem("cityName", cityArr[0]);
            //print recent searches list (cityArr as a list)
            renderButtons();
          }

      var city = (response.name);
      $("#city").text(city);

      var icon = (response.weather[0].icon)
      $("#icon").attr("src", "https://openweathermap.org/img/wn/" + icon + "@2x.png");

      var temp = (response.main.temp);
      //convert to F
      tempF = Math.floor((temp * (9/5)) - 459.67);
      $("#temp").text(tempF);

      var humidity = (response.main.humidity + "%");
      $("#humidity").text(humidity);

      var windSpeed = (response.wind.speed + " mph");
      $("#windSpeed").text(windSpeed);

      // separate api call for UV Index for city based on previous response to get lat & lon values required for UVIndex call
      var uvIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + response.coord.lat + "&lon=" + response.coord.lon;
      console.log("UV Index: " + uvIndexURL);

      $.ajax({
        url: uvIndexURL,
        method: "GET"
      }).then(function(UVresponse) {
        console.log(UVresponse);

        var uvIndex = (UVresponse.value);
        $("#uvIndex").text(uvIndex);

        //source: https://www.epa.gov/sunsafety/uv-index-scale-0
        if(uvIndex < 3){
          $("#uvIndex").addClass("favorable");
          $("#uvIndex").removeClass("severe moderate");
        }
        else if(uvIndex > 8){
          $("#uvIndex").addClass("severe");
          $("#uvIndex").removeClass("favorable moderate");
        }
        else{
          $("#uvIndex").addClass("moderate");
          $("#uvIndex").removeClass("severe favorable");
        }
      });
    });
  }

  //separate api call for 5-day forecast data for city
  function fiveDay(cityName){
    var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + apiKey;
    console.log("5-day: " + fiveDayURL);

    $.ajax({
      url: fiveDayURL,
      method: "GET"
    }).then(function(fiveDayResponse) {
      console.log(fiveDayResponse);

    //loop through 5-day
    var n = 1;
    for (i = 4; i < fiveDayResponse.list.length; i+=8) {
      currentForecastDay = fiveDayResponse.list[i];

      var forecastDate = (currentForecastDay.dt_txt);
      var forecastDateConverted = new Date(forecastDate).toLocaleDateString("en-US");
      console.log(forecastDateConverted);
      $("#forecast" + n + "date").text(forecastDateConverted);

      var forecastIcon = ("https://openweathermap.org/img/wn/" + currentForecastDay.weather[0].icon + "@2x.png");
      $("#forecast" + n + "icon").attr("src", forecastIcon);
                    
      var forecastTemp = (currentForecastDay.main.temp);
      var forecastTempF = Math.floor((forecastTemp * (9/5)) - 459.67);
      $("#forecast" + n + "temp").text("Temperature: " + forecastTempF + " F");
              
      var forecastHumidity = (currentForecastDay.main.humidity);
      $("#forecast" + n + "humidity").text("Humidity: " + forecastHumidity + "%");
        
      n++;
    }
  });
}