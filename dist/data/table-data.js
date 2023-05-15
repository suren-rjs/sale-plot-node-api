export class TableData {
  constructor() {
    this.data = null;
  }
  setData(data) {
    this.data = data;
  }
  getData() {
    return this.data;
  }
  static getInstance() {
    if (!TableData.instance) {
      TableData.instance = new TableData();
    }
    return TableData.instance;
  }
}