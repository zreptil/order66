import {BaseData} from '@/_model/base-data';

export class PictureData extends BaseData {
  url: string;
  info: string;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.url,
      b: this.info
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.url = json?.a ?? def?.url;
    this.info = json?.b ?? def?.info;
  }
}
