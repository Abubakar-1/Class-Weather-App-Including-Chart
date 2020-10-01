const form = document.querySelector(".top-banner form");
const input = document.querySelector(".top-banner input");
const msg = document.querySelector(".top-banner .msg");
const list = document.querySelector(".ajax-section .cities");
const apiKey = "87f6f6b49de0b09b19b6d2f99901b473";

form.addEventListener("submit", (e) => {
  e.preventDefault();
  let inputVal = input.value;

  //check if there's already a city
  const listItems = list.querySelectorAll(".ajax-section .city");
  const listItemsArray = Array.from(listItems);

  console.log({ listItems, listItemsArray });

  if (listItemsArray.length > 0) {
    const filteredArray = listItemsArray.filter((el) => {
      let content = "";
      //Abuja,NG
      if (inputVal.includes(",")) {
        //Abuja,nnnnnnnn->invalid country code, so we keep only the first part of inputVal
        if (inputVal.split(",")[1].length > 2) {
          inputVal = inputVal.split(",")[0];
          content = el
            .querySelector(".city-name span")
            .textContent.toLowerCase();
        } else {
          content = el.querySelector(".city-name").dataset.name.toLowerCase();
        }
      } else {
        //Abuja
        content = el.querySelector(".city-name span").textContent.toLowerCase();
      }
      return content == inputVal.toLowerCase();
    });

    if (filteredArray.length > 0) {
      msg.textContent = `You already know the weather for ${
        filteredArray[0].querySelector(".city-name span").textContent
      } ...otherwise be more specific by providing the country code as well 😉`;
      form.reset();
      input.focus();
      return;
    }
  }

  //ajax here
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${inputVal}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      const { main, name, sys, weather } = data;
      const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

      const li = document.createElement("li");
      li.classList.add("city");
      const markup = `
        <h2 class="city-name" data-name="${name},${sys.country}">
          <button onClick = "fetchForecast('${name + "," + sys.country}')"><span>${name}</span></button>
          <sup>${sys.country}</sup>
        </h2>
        <div class="city-temp">${Math.round(main.temp)}<sup>°C</sup></div>
        <figure>
          <img class="city-icon" src="${icon}" alt="${
        weather[0]["description"]
      }">
          <figcaption>${weather[0]["description"]}</figcaption>
        </figure>
      `;
      li.innerHTML = markup;
      list.appendChild(li);
    })
    .catch(() => {
      msg.textContent = "Sorry, we can't find the city entered";
    });

  msg.textContent = "";
  form.reset();
  input.focus();
});

function fetchForecast(city) {
  launchModal()
  const modalTitle = document.getElementById("modal-title");
  modalTitle.textContent = city;
  document.getElementById("chart-container").innerHTML = "Loading awesome..."
  const forecastDates = [];
  const forecastValues = [];
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if(data) {
        data.list.map((datum, index) => {
          forecastDates.push(convertDate(datum.dt_txt))
          forecastValues.push(datum?.main?.temp)
        })
        generateChart(city, forecastDates, forecastValues)
      }
    })
    .catch(e => {
      console.log({e})
    })
    console.log({forecastDates, forecastValues})
}

function convertDate(date_text) {
  const splittedDate = date_text.split(" ");
  const splittedDays = splittedDate[0].split("-");
  const newDateFormat = `${splittedDays[1]}/${splittedDays[2]}/${splittedDays[0][2]}${splittedDays[0][3]}`

  const splittedTime = splittedDate[1].split(":")
  const newTimeFormat = `${splittedTime[0]}:${splittedTime[1]}`

  return `${newDateFormat} ${newTimeFormat}`
}

function generateChart(city, dates, values) {
  Highcharts.chart('chart-container', {
    chart: {
      type: 'line'
    },
    title: {
      text: `${city} 5-day weather forecast`
    },
    subtitle: {
      text: 'Source: Open weather map'
    },
    xAxis: {
      categories: dates
    },
    yAxis: {
      title: {
        text: 'Temperature (°C)'
      }
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true
        },
        enableMouseTracking: true
      }
    },
    series: [{
      name: city,
      data: values
    }]
  });
}

function launchModal() {
  const modalEl = document.getElementsByClassName("modal")
  const backdropEl = document.getElementsByClassName("backdrop")
  modalEl[0].classList.remove("hide")
  backdropEl[0].classList.remove("hide")
}

function closeModal() {
  const modalEl = document.getElementsByClassName("modal")
  const backdropEl = document.getElementsByClassName("backdrop")
  modalEl[0].classList.add("hide")
  backdropEl[0].classList.add("hide")
  document.getElementById('modal-title').innerHTML = ""
  document.getElementById('chart-container').innerHTML = ""
}
