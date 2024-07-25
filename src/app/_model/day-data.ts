import {BaseData} from '@/_model/base-data';
import {Utils} from '@/classes/utils';
import {TimeData} from '@/_model/time-data';

export class DayData extends BaseData {
  date: Date;
  timeRanges: TimeData[];

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  override get _asJson(): any {
    return {
      a: Utils.fmtDate(this.date, 'yyyyMMdd'),
      b: this.mapJsonArray(this.timeRanges),
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.date = Utils.parseDate(json?.a ?? def?.date);
    this.timeRanges = (json?.b ?? def?.actions)?.map((src: any) => new TimeData(src));
    this.timeRanges ??= [];
    while (this.timeRanges.length < 3) {
      this.timeRanges.push(new TimeData({
        0: this.timeRanges.length + 1,
        a: this.timeRanges.length
      }));
    }
    let type = 0;
    this.timeRanges = this.timeRanges?.map(t => {
      t.type = type++;
      return t;
    });
  }
}
