import {BaseData} from '@/_model/base-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {DayData} from '@/_model/day-data';
import {GLOBALS} from '@/_services/globals.service';

export class PlanData extends BaseData {
  period: DatepickerPeriod;
  sitter: number; // fkUser of PersonData
  days: DayData[];

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  get sitterData(): string {
    const data = GLOBALS.sitterList?.find((sitter) => +sitter.fkUser === +this.sitter);
    return data?.fullname;
  }

  override get _asJson(): any {
    return {
      a: this.period.toString(),
      b: this.sitter,
      c: this.days?.map((entry, index) => {
        entry.id = index + 1;
        return entry.asJson;
      })
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.period = new DatepickerPeriod(json?.a ?? def?.period);
    this.sitter = json?.b ?? def?.sitter;
    this.days = (json?.c ?? def?.days)?.map((src: any) => new DayData(src));
  }
}
