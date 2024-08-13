import {BaseData} from '@/_model/base-data';
import {UserType} from '@/_model/app-data';

export class PictureData extends BaseData {
  url: string;
  info: string;
  userType: UserType;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.url,
      b: this.info,
      c: this.userType,
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.url = json?.a ?? def?.url;
    this.info = json?.b ?? def?.info;
    this.userType = json?.c ?? def?.userType ?? UserType.Sitter;
  }
}
