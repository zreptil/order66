import {BaseData} from '@/_model/base-data';
import {ActionData} from '@/_model/action-data';
import {PictureData} from '@/_model/picture-data';

export enum TimeType {
  morning,
  evening,
  eventually
}

export class TimeData extends BaseData {
  static timeTypeNames = [
    $localize`Morning`, $localize`Evening`, $localize`Eventually`
  ];
  static timeTypeIcons = [
    'light_mode', 'nightlight', 'today'
  ];
  type: number;
  actions: ActionData[];
  pictures: PictureData[];
  info: string;

  constructor(json?: any) {
    super(json);
  }

  get typeName(): string {
    return TimeData.timeTypeNames[this.type] ?? '???';
  }

  get typeIcon(): string {
    return TimeData.timeTypeIcons[this.type] ?? '???';
  }

  override get _asJson(): any {
    return {
      a: this.type,
      b: this.mapArrayToJson(this.actions),
      c: this.info,
      d: this.mapArrayToJson(this.pictures)
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.type = json?.a ?? def?.type;
    this.actions = this.mapArrayToModel(json?.b ?? def?.actions, ActionData);
    this.info = json?.c ?? def?.info;
    this.pictures = this.mapArrayToModel(json?.d ?? def?.pictures, PictureData);
  }
}
