import {BaseData} from '@/_model/base-data';
import {ActionData} from '@/_model/action-data';

export enum TimeType {
  morning,
  evening,
  eventually
}

export class TimeData extends BaseData {
  static timeTypeNames = [
    $localize`Morning`, $localize`Evening`, $localize`Eventually`
  ];
  type: number;
  actions: ActionData[];

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  get typeName(): string {
    return TimeData.timeTypeNames[this.type] ?? '???';
  }

  override get _asJson(): any {
    return {
      a: this.type,
      b: this.mapJsonArray(this.actions),
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.type = json?.a ?? def?.type;
    this.actions = (json?.b ?? def?.actions)?.map((src: any) => new ActionData(src));
  }
}
