/* 
this time: I'll make line/area charts with timelines.
each country: 5 charts, 1 for each statistic.

each continent: just like before, no timeLine. 

entire world: timeline, all data combined.
*/

/* 
dataType: worldData summed tohasOwnPropertyher, country data.
type of chart to make: 1. timeline: -Y is numbers, X is time.
each country will have maybe 6 timeline charts, 1 for each data type.




*/

class dataManager {
  constructor() {
    this.globalTimeLine = 'https://corona-api.com/timeline';
    this.countriesURL = 'https://corona-api.com/countries';
    this.proxy = 'https://api.codetabs.com/v1/proxy?quest=';
    this.countrylistURL = 'https://restcountries.herokuapp.com/api/v1';
  }
  async init() {
    this.countryMapObject = await this.fetchCountryListObject();
    this.continentCovidArray = await this.fetchBasicDataByContinent();
    this.worldTimeLineArray = await this.fetchWorldTimeLineData();
    // this.worldCovidDataShort = this.worldCovidDataShort;
  }
  async fetchCountryListObject() {
    const countryListResponse = await fetch(this.proxy + this.countrylistURL);
    const countryListJSON = await countryListResponse.json();
    return Object.fromEntries(
      countryListJSON.map((element) => {
        return [
          element.name.common,
          {
            code: element.cca2,
            region: element.region,
          },
        ];
      })
    );
  }
  async fetchBasicDataByContinent() {
    const response = await fetch(this.proxy + this.countriesURL);
    let dataJSON = await response.json();
    dataJSON = dataJSON.data;
    this.worldCovidDataShort = dataJSON
      .filter((x) => this.countryMapObject.hasOwnProperty(x.name))
      .map((x) => {
        return {
          name: x.name,
          code: x.code,
          region: this.countryMapObject[x.name].region,
          data: {
            total_cases: x.latest_data.confirmed,
            new_cases: x.today.confirmed,
            total_deaths: x.latest_data.deaths,
            new_deaths: x.today.deaths,
            total_recovered: x.latest_data.recovered,
            critical_condition: x.latest_data.critical,
          },
        };
      });
    return [
      worldCovidDataShort.filter((x) => x.region === 'Africa'),
      worldCovidDataShort.filter((x) => x.region === 'Americas'),
      worldCovidDataShort.filter((x) => x.region === 'Asia'),
      worldCovidDataShort.filter((x) => x.region === 'Europe'),
      worldCovidDataShort.filter((x) => x.region === 'Oceania'),
    ];
  }
  async fetchWorldTimeLineData() {
    const response = await fetch(this.proxy + this.globalTimeLine);
    let dataJSON = await response.json();
    dataJSON = dataJSON.data;
    return dataJSON.map((x) => {
      delete x.updated_at;
      const dateReturn = x.date;
      delete x.date;
      return { date: dateReturn, data: x };
    });
  }
  //this for later, not in the init.
  async fetchCountryFullData(countryName) {
    const countryCode = this.countryMapObject[countryName].code;
    const response = await fetch(
      this.proxy + this.countriesURL + '/' + countryCode
    );
    let countryJSON = await response.json();
    countryJSON = countryJSON.data.timeline || undefined;
    return countryJSON.map((x) => {
      delete x.updated_at;
      const dateReturn = x.date;
      delete x.date;
      return { date: dateReturn, data: x };
    });
  }
}

class chartManager {
  constructor() {
    this.numberOfLineCharts = 0;
    this.numberOfPieCharts = 0;
    this.numberOfHorizontalBarCharts = 0;
  }
  deleteAllCharts() {
    for (let i = 0; i < this.numberOfLineCharts; i++) {
      this.lineCharts[i].destroy();
      this.lineCharts[i] = null;
    }
    for (let i = 0; i < this.numberOfPieCharts; i++) {
      this.lineCharts[i].destroy();
      this.lineCharts[i] = null;
    }
    for (let i = 0; i < this.numberOfHorizontalBarCharts; i++) {
      this.lineCharts[i].destroy();
      this.lineCharts[i] = null;
    }
  }
  updateHTMLCharts() {}

  makelineChart(
    chartName,
    xLabelsArrayTime,
    dataLabelY,
    dataArray,
    displayText
  ) {
    this.lineCharts[chartName] = new Chart(
      document.getElementById('line-chart'),
      {
        type: 'line',
        data: {
          labels: xLabelsArrayTime,
          datasets: [
            {
              data: dataArray,
              label: dataLabelY,
              borderColor: '#3e95cd',
              fill: false,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: displayText,
          },
        },
      }
    );
    this.numberOfLineCharts++;
  }

  makePieChart(
    chartName,
    XLabelsContinentNames,
    currentStatName,
    dataArray,
    displayText
  ) {
    this.pieCharts[chartName] = new Chart(
      document.getElementById('pie-chart'),
      {
        type: 'pie',
        data: {
          labels: XLabelsContinentNames,
          datasets: [
            {
              label: currentStatName,
              backgroundColor: [
                '#3e95cd',
                '#8e5ea2',
                '#3cba9f',
                '#e8c3b9',
                '#c45850',
              ],
              data: dataArray,
            },
          ],
        },
        options: {
          title: {
            display: true,
            text: displayText,
          },
        },
      }
    );
    this.numberOfPieCharts++;
  }
  makeHorizontalBarChart(chartName, countryNamesArray) {
    this.horizontalBarCharts[chartName] = Chart(
      document.getElementById('bar-chart-horizontal'),
      {
        type: 'horizontalBar',
        data: {
          labels: countryNamesArray,
          datasets: [
            {
              label: 'Population (millions)',
              backgroundColor: [
                '#3e95cd',
                '#8e5ea2',
                '#3cba9f',
                '#e8c3b9',
                '#c45850',
              ],
              data: [2478, 5267, 734, 784, 433],
            },
          ],
        },
        options: {
          legend: { display: true },
          title: {
            display: true,
            text: 'Predicted world population (millions) in 2050',
          },
        },
      }
    );
    this.numberOfHorizontalBarCharts++;
  }
}

class covid19Statistics {
  constructor() {
    this.data = new dataManager();
    this.chartManager = new chartManager();
  }
  async init() {
    await this.data.init();
  }
  setMainHandlers() {
    const selectContinent = document.querySelector('.continents');
    const selectData = document.querySelector('.chooseData');
    selectContinent.addEventListener('change', chooseContinentHandler);
    selectData.addEventListener('change', chooseDataHandler);
  }
  //schematics. will implement later.
  chooseContinentHandler(event) {
    const continentButton = document.querySelector('.continents');
    const chooseData = document.querySelector('.chooseData');
    deleteAllCharts();
    emptyCountrySelect();

    if (
      continentButton.value === 'choose continent' ||
      chooseData.value === 'choose statistic'
    ) {
      emptyDataSelect();
      return;
    }
    if (continentButton.value === 'world') updateDataSelect();
    updateCountrySelect();
    drawCharts();
  }

  /* 
    makelineChart(
    chartName,
    xLabelsArrayTime,
    dataLabelY,
    dataArray,
    displayText
  )
  */

  async newCountryChart(event) {
    const countryName = event.target.value;
    const country = this.data.countryMapObject[countryName];
    if (event.target.value === 'please choose a country:') return;
    this.chartManager.deleteAllCharts();
    const flagDiv = document.querySelector('.flag');
    const flagsUrl = `https://www.countryflags.io/${country.code.toLowerCase()}/flat/64.png`;
    flagDiv.style.background = `url(${flagsUrl}) center center/cover`;
    const countryTimeLine = await this.data.fetchCountryFullData(countryName);

    const countrydata = {};
    for (let i = 0; i < countryTimeLine.length; i++) {
      countrydata['dates'].push(countryTimeLine[i].date);
      countrydata['active'].push(countryTimeLine[i].data.active);
      countrydata['confirmed'].push(countryTimeLine[i].data.confirmed);
      countrydata['deaths'].push(countryTimeLine[i].data.deaths);
      countrydata['new_confirmed'].push(countryTimeLine[i].data.new_confirmed);
      countrydata['new_deaths'].push(countryTimeLine[i].data.new_deaths);
      countrydata['new_recovered'].push(countryTimeLine[i].data.new_recovered);
      countrydata['recovered'].push(countryTimeLine[i].data.recovered);
    }
    for (const [key, value] of Object.entries(countrydata)) {
      if (key == 'dates') continue;
      this.chartManager.makelineChart(
        `${countryName} covid-19 timeline`,
        countrydata.dates,
        key,
        value,
        `${key} - ${countryName}`
      );
    }
    this.chartManager.updateHTMLCharts();
  }
}

async function getData() {
  window.data = new dataManager();
  await data.init();
  const israelData = await data.fetchCountryFullData('il');
  console.log(data.countryMapObject);
  console.log(data.continentCovidArray);
  console.log(data.worldTimeLineArray);
  console.log(israelData);
}
getData();
