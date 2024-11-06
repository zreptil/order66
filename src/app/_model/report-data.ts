export class ReportData {
  error: Error;
  isValid = true;
  mustReload = false;
  begDate: Date;
  endDate: Date;
  data: any;

  constructor() {
  }

  // get data(): ListData {
  //   return GLOBALS == null
  //     ? this.calc
  //     : GLOBALS.isDataSmoothing
  //       ? this.calc
  //       : this.ns;
  // }
}
