import {BaseData} from '@/_model/base-data';
import {PictureData} from '@/_model/picture-data';
import {Utils} from '@/classes/utils';

export class ActionData extends BaseData {
  text: string;
  done: boolean;
  pictures: PictureData[];
  created: number;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.text,
      b: this.done,
      c: this.pictures,
      d: this.created ?? Utils.now.getTime()
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.text = json?.a ?? def?.text;
    this.done = json?.b ?? def?.done;
    this.pictures = this.mapArrayToModel(json?.c ?? def?.pictures, PictureData);
    this.created = json?.d ?? def?.created;
  }
}
