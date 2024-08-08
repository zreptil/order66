import {BaseData} from '@/_model/base-data';
import {PictureData} from '@/_model/picture-data';

export class ActionData extends BaseData {
  text: string;
  done: boolean;
  pictures: PictureData[];

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.text,
      b: this.done,
      c: this.pictures
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.text = json?.a ?? def?.text;
    this.done = json?.b ?? def?.done;
    this.pictures = this.mapArrayToModel(json?.c ?? def?.pictures, PictureData);
  }
}
