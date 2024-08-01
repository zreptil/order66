import {BaseData} from '@/_model/base-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {DayData} from '@/_model/day-data';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';

export class PlanData extends BaseData {
  period: DatepickerPeriod;
  info: string;
  sitter: number; // fkUser of PersonData
  days: DayData[];
  past: number;

  constructor(json?: any) {
    super(json);
  }

  get sitterData(): string {
    const data = GLOBALS.sitterList?.find((sitter) => sitter.fkUser === this.sitter);
    if (data?.phone != null) {
      return `${data.fullname} (${data.phone})`;
    }
    return data?.fullname;
  }

  override get _asJson(): any {
    return {
      a: this.period.toString(),
      b: this.sitter,
      c: this.mapJsonArray(this.days),
      d: this.info
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.period = new DatepickerPeriod(json?.a ?? def?.period);
    this.sitter = json?.b ?? def?.sitter;
    this.days = (json?.c ?? def?.days)?.map((src: any) => new DayData(src));
    this.info = json?.d ?? def?.info;
    this.days?.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    })
    // calculate number of days the plan lays in the past
    this.past = (Utils.now.getTime() - this.period.end?.getTime()) / (24 * 60 * 60000);
  }
}
