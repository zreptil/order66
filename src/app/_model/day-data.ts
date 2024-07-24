import {BaseData} from '@/_model/base-data';
import {ActionData} from '@/_model/action-data';
import {Utils} from '@/classes/utils';

export class DayData extends BaseData {
  date: Date;
  actions: ActionData[];

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  override get _asJson(): any {
    return {
      a: Utils.fmtDate(this.date, 'yyyyMMdd'),
      b: this.actions?.map((entry, index) => {
        entry.id = index + 1;
        return entry.asJson;
      })
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.date = Utils.parseDate(json?.a ?? def?.date);
    this.actions = (json?.b ?? def?.actions)?.map((src: any) => new ActionData(src));
  }
}
