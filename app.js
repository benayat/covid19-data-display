// localStorage.setItem('myFirstKey', 'myFirstValue');
// console.log(localStorage.getItem('myFirstKey'));

// //helper functions: for storing big databases like maps in localStorage, we need to change the map into an array, and back when converting back:
// function replacer(key, value) {
//   if (value instanceof Map) {
//     return {
//       dataType: 'Map',
//       value: Array.from(value.entries()), // or with spread: value: [...value]
//     };
//   } else {
//     return value;
//   }
// }
// function reviver(key, value) {
//   if (typeof value === 'object' && value !== null) {
//     if (value.dataType === 'Map') {
//       return new Map(value.value);
//     }
//   }
//   return value;
// }

// const originalValue = [
//   new Map([
//     [
//       'a',
//       {
//         b: {
//           c: new Map([['d', 'text']]),
//         },
//       },
//     ],
//   ]),
// ];
// const str = JSON.stringify(originalValue, replacer);
// const newValue = JSON.parse(str, reviver);
// console.log(originalValue, newValue);

//some stats: 250 countries in the world.
//53 in europe
//50 in asia
//57 in americas
//27 in oceania
//59 in africa

//first, lets get the data:
//1. a set of all the countries in the region - map of common => cca2 names:

const proxy = 'https://api.codetabs.com/v1/proxy?quest=';

async function fetchAllCovidCountries() {
  const covidResponse = await fetch(`${proxy}https://corona-api.com/countries`);
  const covidCountries = await covidResponse.json();
  countriesMap = new Map();
  for (let i = 0; i < covidCountries.data.length; i++) {
    countriesMap.set(covidCountries.data[i].code, covidCountries.data[i]);
  }
  return countriesMap;
}

async function fetchCountryList(urlDataContinent, countriesMap) {
  const countryArray = [];
  const regionURL = `${urlDataContinent}`;
  const response = await fetch(regionURL);
  const data = await response.json();
  for (let i = 0; i < data.length; i++) {
    if (!countriesMap.has(data[i]['cca2'])) {
      continue;
    }
    countryArray.push({ name: data[i].name.common, code: data[i]['cca2'] });
  }
  return countryArray;
}
//taking the data from the fetchCountryList function into an array.
//plus, adding to local storage each continent(the key) and its set of countries as a string(value).
// http://corona-api.com/countries/:code
//https://restcountries.herokuapp.com/api/v1/region/:region_name
//proxy: http://www.whateverorigin.org/get?url=

async function getAllCountries() {
  const proxy = 'https://api.codetabs.com/v1/proxy?quest=';
  const countriesURL = 'https://restcountries.herokuapp.com/api/v1/region/';
  const regionArray = ['Asia', 'Europe', 'Africa', 'Americas', 'Oceania'];
  const regionData = {};
  let countriesMap = await fetchAllCovidCountries();
  for (let i = 0; i < regionArray.length; i++) {
    const currentRegion = await fetchCountryList(
      proxy + countriesURL + regionArray[i],
      countriesMap
    );
    regionData[regionArray[i]] = currentRegion;
    // const regionString = JSON.stringify(currentRegion, replacer);
    // localStorage.setItem(x, regionString);
  }

  return [regionData, countriesMap];
}
//third and last data function(probabely):
//-get all countries from the covid19 database
//-add all necessary continent stats to an array, and all country stats to another array.
//- add both arrays as data instead of the current cca2 ISO 3166-1 alpha-2 format of country code.

// so in the end, we have: an array of all 5 continents, each continent is a map of countries, and each countrie is a key-value of country common name, and the value is an array with two arrays: one for all continent related data, and the other is an array with all country related data.

async function getCovidData() {
  const [countriesByContinents, countriesMap] = await getAllCountries();
  const proxy = 'https://api.codetabs.com/v1/proxy?quest=';
  const covidGenericURL = 'http://corona-api.com/countries/';
  for (let continent of Object.values(countriesByContinents)) {
    for (let i = 0; i < continent.length; i++) {
      const countryName = continent[i].name;
      const countryCode = continent[i].code;
      const data = countriesMap.get(countryCode);
      const continentDataToGraph = {};
      const latestData = data['latest_data'];
      const confirmed_cases = latestData['confirmed'];
      const number_of_deaths = latestData['deaths'];
      const number_of_recovered = latestData['recovered'];
      const number_of_critical_condition = latestData['critical'];
      continentDataToGraph['confirmed_cases'] = confirmed_cases;
      continentDataToGraph['number_of_deaths'] = number_of_deaths;
      continentDataToGraph['number_of_recovered'] = number_of_recovered;
      continentDataToGraph[
        'number_of_critical_condition'
      ] = number_of_critical_condition;
      const countryData = {};
      const total_cases = confirmed_cases;
      const new_cases = data['today']['confirmed'];
      const total_deaths = number_of_deaths;
      const new_deaths = data['today']['deaths'];
      const total_recovered = number_of_recovered;
      const in_critical_condition = number_of_critical_condition;

      countryData['total_cases'] = total_cases;
      countryData['new_cases'] = new_cases;
      countryData['total_deaths'] = total_deaths;
      countryData['new_deaths'] = new_deaths;
      countryData['total_recovered'] = total_recovered;
      countryData['in_critical_condition'] = in_critical_condition;

      continent[i] = {
        name: countryName,
        data: { continentData: continentDataToGraph, countryData: countryData },
      };
      countriesMap.set(countryCode, continent[i]);
    }
  }
  return [countriesByContinents, countriesMap];
}

function setHandlers(data, chart) {
  const continentButton = document.querySelector('.continents');
  const chooseData = document.querySelector('.chooseData');
  chooseData.addEventListener('change', () => makeChartHandler(data, chart));
  continentButton.addEventListener('change', () =>
    makeChartHandler(data, chart)
  );
}
//notes: in the case when we need to use the map for the entire world data, I'll first remove the empty places where there isn't any real covid data.

//just for fun, I tried to find a good way to empty the necessary parts performance wise.
//I know it's not all necessary, especially the string part, but for clarity purposes it good.

function updateOrMakechart(data, chart = undefined) {
  const continentSelect = document.querySelector('.continents');
  let continent;
  if (continentSelect.value === 'world') {
    data = [...data[1].values()].filter((x) => x.hasOwnProperty('data'));
    continent = data;
  } else {
    data = data[0];
    continent = data[continentSelect.value];
  }
  const chooseData = document.querySelector('.chooseData');
  const dataY = chooseData.value
    .split(' ')
    .map((x) => x.charAt(0).toLowerCase() + x.slice(1))
    .join('_');

  const xLabels = continent.map((x) => x.name);
  const yLabel = `${chooseData.value}`;
  const chartData = continent.map((x) => x.data.continentData[dataY]);
  const displayText = `${continentSelect.value} ${chooseData.value}`;
  if (!chart) {
    const chart = makeChart(xLabels, yLabel, chartData, displayText);
  } else {
    document.body.querySelector('.chartContainer').innerHTML = '';
    Chart.helpers.each(Chart.instances, function (instance) {
      instance.destroy();
      chart = makeChart(xLabels, yLabel, chartData, displayText);
    });
  }
  return chart;
}

function makeChart(xLabels, yLabel, chartData, displayText) {
  innerhtml = `<div class="chartContainer">
  <canvas id="myChart"> </canvas>
</div>`;
  document.body.insertAdjacentHTML('afterbegin', innerhtml);
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

function makeChartHandler(data, chart) {
  updateOrMakechart(data, chart);
}

async function go() {
  try {
    const data = await getCovidData();
    const chart = updateOrMakechart(data);
    setHandlers(data, chart);

    console.log(data);
  } catch (error) {
    console.log(error);
  }
}
go();
