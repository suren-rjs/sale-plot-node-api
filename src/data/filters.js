export class Filters {
  constructor() {
    this.data = {};
  }

  setFilters(listOfPrice, listOfYears) {
    this.data.priceList = listOfPrice;
    this.data.yearList = listOfYears;
  }

  getData() {
    return this.data;
  }

  static getInstance() {
    if (!Filters.instance) {
      Filters.instance = new Filters();
    }
    return Filters.instance;
  }
}
