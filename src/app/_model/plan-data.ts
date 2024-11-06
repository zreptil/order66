import {BaseData} from '@/_model/base-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {DayData} from '@/_model/day-data';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {PersonData} from '@/_model/person-data';

export enum PlanStatus {
  denied,
  accepted
}

export class PlanData extends BaseData {
  period: DatepickerPeriod;
  info: string;
  sitter: number; // fkUser of PersonData
  status: PlanStatus;
  statusInfo: string;
  days: DayData[];
  // the days the plan lays in the past
  past: number;

  constructor(json?: any) {
    super(json);
  }

  get sitterPerson(): PersonData {
    return GLOBALS.sitterList?.find((sitter) => sitter.fkUser === this.sitter);
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
      c: this.mapArrayToJson(this.days),
      d: this.info,
      e: this.status,
      f: this.statusInfo,
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.period = new DatepickerPeriod(json?.a ?? def?.period);
    this.sitter = json?.b ?? def?.sitter;
    this.days = this.mapArrayToModel(json?.c ?? def?.days, DayData);
    this.info = json?.d ?? def?.info;
    this.status = json?.e ?? def?.status;
    this.statusInfo = json?.f ?? def?.statusInfo;
    this.days?.sort((a, b) => {
      return a.date.getTime() - b.date.getTime();
    })
    // calculate number of days the plan lays in the past
    this.past = (Utils.now.getTime() - this.period.end?.getTime()) / (24 * 60 * 60000);
  }
}
