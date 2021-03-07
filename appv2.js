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
        total_recovered: element.latest_data.recovered,
      };
    })
    .filter((x) => x.region !== '');
  return covidCountriesArray;
}
function setMainHandlers(data) {
  const continentButton = document.querySelector('.continents');
  const chooseData = document.querySelector('.chooseData');

  const updatedHandler = updateChartHandler.bind(null, data);
  chooseData.addEventListener('change', updatedHandler);

  continentButton.addEventListener('change', updatedHandler);
}

/* 
I had a problem - I wanted to take the data from the chart to the right select(country list), 
but as soon as a change detected, the chart data would change, so I just had to implement a "wait" function,
so when we take the data from the chart, it will still be there.

* I wonder if I should limit the wait just for the continent select, or leave it at that. 
*/
function wait(delayTime) {
  return new Promise((resolve) => setTimeout(resolve, delayTime));
}
/* 
I tried all different methods of updating the chart instead of destroying and rebuilding. none worked. even the API's destroy function leaves traces of the previous chart, so when I hovered over the new chart, old data appeared. when I used the clear function, rebuilding the chart failed.  this is the only solution I came up with - assigning null after destroying the chart.
*/

function destroyChart() {
  if (typeof chart !== 'undefined' && chart != null) {
    chart.destroy();
    chart = null;
    document.querySelector('.imgDiv').classList.remove('invisible');
  }
}

function updateChartHandler(data, event = null) {
  const continentButton = document.querySelector('.continents');
  const chooseData = document.querySelector('.chooseData');
  let dataConcrete = _.cloneDeep(data);
  document.querySelector('.chartContainer').classList.remove('containerResize');
  if (continentButton.value === 'choose continent') {
    onContinentChange(null);
    document
      .querySelector('.chartContainer')
      .classList.remove('containerResize');
    return;
  }

  dataConcrete =
    continentButton.value === 'world'
      ? dataConcrete
      : dataConcrete.filter((x) => x.region === continentButton.value);
  if (event && event.target === continentButton) {
    onContinentChange(dataConcrete);
  }
  destroyChart();
  if (chooseData.value === 'choose statistic') return;
  document.querySelector('.imgDiv').classList.add('invisible');

  return (chart = makeChart(
    'bar',
    dataConcrete.map((x) => x.name),
    chooseData.value,
    dataConcrete.map(
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
function makeChart(type, xLabels, yLabel, chartData, displayText) {
  const chartElement = document.querySelector('#myChart').getContext('2d');
  let chart = new Chart(chartElement, {
    type: type,
    data: {
      labels: xLabels,
      datasets: [
        {
          label: yLabel,
          data: chartData,
          backgroundColor: 'rgb(232, 134, 14)',
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
        fontStyle: 'bold',
        fontColor: '#000000',
        fontSize: 30,
        lineHeight: 2,
      },
      legend: {
        display: true,
        position: 'right',
        labels: {
          fontColor: '#000000',
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
//note: even though just assignment operator is enough for shallow primitive array copy, (I checked!), I used the spread operator just to make it look better :)
/* 
note - the method I tried - I added a chache property to the chart, to save the data inside. this way I (hopefully) can take the data directly from the chart instead of just passing it as a parameter.
*/
/* 
I used innerHtml to clean up the countrySelect - this way it will get read of the previous event listener as well.

- if its the first visit - no event to remove
*/
//I was forced to use a global variable here to bind, since it looks like it's the only way to remove an event listener.
function onContinentChange(data, firstTime = false) {
  const countrySelect = document.getElementById('countries');
  while (countrySelect.length > 1) countrySelect.remove(1);
  if (document.querySelector('.continents').value === 'choose continent') {
    destroyChart();
    return;
  }

  const countriesData =
    data.length > 70
      ? data
      : data.filter(
          (x) => x.region === document.querySelector('.continents').value
        );
  if (typeof countriesDataBind === 'undefined')
    window.countriesDataBind = newCountryChart.bind(null, countriesData);

  if (!firstTime)
    countrySelect.removeEventListener('change', countriesDataBind);
  const allCountriesNames = countriesData.map((x) => x.name);
  allCountriesNames.forEach((element) => {
    countrySelect.insertAdjacentHTML(
      'beforeend',
      `<option class = 'country'>${element}</option>`
    );
  });
  countrySelect.firstElementChild.selected = true;
  window.countriesDataBind = newCountryChart.bind(null, countriesData);
  countrySelect.addEventListener('change', countriesDataBind);
}

function newCountryChart(data, event) {
  const country = data.find((x) => x.name === event.target.value);
  if (event.target.value === 'please choose a country:') return;
  destroyChart();
  const countryData = [
    { 'total cases': country.confirmed_cases },
    { 'new cases': country.new_cases },
    { 'total deaths': country.number_of_deaths },
    { 'new deaths': country.new_deaths },
    { 'total recovered': country.total_recovered },
  ];
  document.querySelector('.chartContainer').classList.add('containerResize');
  const flagDiv = document.querySelector('.flag');
  const flagsUrl = `https://www.countryflags.io/${country.code.toLowerCase()}/flat/64.png`;
  flagDiv.style.background = `url(${flagsUrl}) center center/cover`;
  document.querySelector('.imgDiv').classList.add('invisible');
  window.chart = makeChart(
    'horizontalBar',
    countryData.map((x) => Object.keys(x)[0]),
    country.name,
    countryData.map((x) => Object.values(x)[0]),
    `${country.name} covid-19 Statistics`
  );
}
async function go() {
  const dataArray = await fetchData();
  window.chart = await updateChartHandler(dataArray);
  onContinentChange(dataArray, 'true');
  setMainHandlers(dataArray);
}
go();
