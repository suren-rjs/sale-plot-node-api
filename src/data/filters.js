export class Filters {
  constructor() {
    this.data = {};
  }

  setFilters(listOfPrice, listOfYears, odoReadingList) {
    this.data.priceList = listOfPrice;
    this.data.yearList = listOfYears;
    this.data.odoReadingList = odoReadingList;
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
