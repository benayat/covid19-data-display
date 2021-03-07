/* 
this time: I'll make line/area charts with timelines.
each country: 5 charts, 1 for each timeline.

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
    const continentData = dataJSON
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
      continentData.filter((x) => x.region === 'Africa'),
      continentData.filter((x) => x.region === 'Americas'),
      continentData.filter((x) => x.region === 'Asia'),
      continentData.filter((x) => x.region === 'Europe'),
      continentData.filter((x) => x.region === 'Oceania'),
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
  async fetchCountryFullData(countryCode) {
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
