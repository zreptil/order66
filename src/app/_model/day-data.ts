import {BaseData} from '@/_model/base-data';
import {Utils} from '@/classes/utils';
import {TimeData} from '@/_model/time-data';
import {ActionData} from '@/_model/action-data';

export class DayData extends BaseData {
  date: Date;
  timeRanges: TimeData[];

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: Utils.fmtDate(this.date, 'yyyyMMdd'),
      b: this.mapArrayToJson(this.timeRanges),
    };
  }

  iconForDone(action: ActionData) {
    if (action.done) {
      return 'done';
    }
    if (Utils.isToday(this.date)) {
      return 'check_box_outline_blank';
    }
    return 'close';
  }

  override _fillFromJson(json: any, def?: any): void {
    this.date = Utils.parseDate(json?.a ?? def?.date);
    this.timeRanges = this.mapArrayToModel(json?.b ?? def?.actions, TimeData);
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
