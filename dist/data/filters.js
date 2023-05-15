export class Filters {
  constructor() {
    this.data = {};
  }
  setFilters(listOfYears, modelList, odoReadingList) {
    this.data.modelList = modelList;
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