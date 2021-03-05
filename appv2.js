async function fetchData() {
  const proxy = 'https://api.codetabs.com/v1/proxy?quest=';
  const covidURL = 'https://corona-api.com/countries';
  const countrylistURL = 'https://restcountries.herokuapp.com/api/v1';
  const covidResponse = await fetch(`${proxy}${covidURL}`);
  let covidJSON = await covidResponse.json();
  covidJSON = covidJSON.data;
  const countriesResponse = await fetch(`${proxy}${countrylistURL}`);
  const countriesJSON = await countriesResponse.json();
  //I'll turn it to object of {name and object} which will contain also the code and region.
  //the reason for that - searching an object with the "has own property" takes only O(1), and I'll need to do it with all the next array elements.
  const CountriesObject = Object.fromEntries(
    countriesJSON.map((element) => {
      return [
        element.name.common,
        {
          code: element.cca2,
          region: element.region,
        },
      ];
    })
  );
  //create an array of objects which will contain all the necessary data of covid-19 we need.
  const covidCountriesArray = covidJSON
    .filter((element) => CountriesObject.hasOwnProperty(element.name))
    .map((element) => {
      return {
        name: element.name,
        code: element.code,
        region: CountriesObject[element.name].region,
        confirmed_cases: element.latest_data.confirmed,
        number_of_deaths: element.latest_data.deaths,
        number_of_recovered: element.latest_data.recovered,
        number_of_critical_condition: element.latest_data.critical,
        new_cases: element.today.confirmed,
        new_deaths: element.today.deaths,
        total_recovered: element.recovered,
      };
    })
    .filter((x) => x.region !== '');
  return covidCountriesArray;
}
function setHandlers(data) {
  const continentButton = document.querySelector('.continents');
  const chooseData = document.querySelector('.chooseData');
  chooseData.addEventListener('change', () => updateChartHandler(data));
  continentButton.addEventListener('change', () => updateChartHandler(data));
}
function updateChartHandler(data) {
  const continentButton = document.querySelector('.continents');
  const chooseData = document.querySelector('.chooseData');
  if (typeof chart !== 'undefined') {
    // chart.clear();
    chart.destroy();
    chart = null;
  }
  data =
    continentButton.value === 'world'
      ? data
      : data.filter((x) => x.region === continentButton.value);
  return (chart = makeChart(
    data.map((x) => x.name),
    chooseData.value,
    data.map(
      (x) =>
        x[
          chooseData.value
            .split(' ')
            .map((x) => x.charAt(0).toLowerCase() + x.slice(1))
            .join('_')
        ]
    ),
    `${chooseData.value} - ${continentButton.value}`
  ));
}
function makeChart(xLabels, yLabel, chartData, displayText) {
  const chartElement = document.querySelector('#myChart').getContext('2d');
  let chart = new Chart(chartElement, {
    type: 'bar',
    data: {
      labels: xLabels,
      datasets: [
        {
          label: yLabel,
          data: chartData,
          backgroundColor: 'rgb(255, 99, 132)',
          borderWidth: 1,
          borderColor: '#777',
          hoverBorderWidth: 3,
          hoverBorderColor: '#000',
        },
      ],
    },
    options: {
      title: {
        display: true,
        text: displayText,
        fonstSize: 24,
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          fontColor: '#000',
        },
      },
      layout: {
        padding: {
          left: 50,
          right: 0,
          bottom: 0,
          top: 0,
        },
      },
      tooltips: {
        enables: true,
      },
    },
  });
  return chart;
}

//part 2 - country stats cards:
function onContinentChange(event) {}

async function go() {
  dataArray = await fetchData();
  window.chart = updateChartHandler(dataArray);
  setHandlers(dataArray);
}
go();
