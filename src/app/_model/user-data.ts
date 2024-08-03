import {BaseData} from '@/_model/base-data';

export class UserData extends BaseData {

  username: string;
  permissions: number[];
  usertype: number;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.username,
      b: this.permissions.filter(entry => (+(entry ?? 0)) !== 0),
      c: this.usertype,
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.username = json?.a ?? def?.username;
    this.permissions = (json?.b ?? def?.permission ?? []).map((entry: string) => +entry);
    this.usertype = json?.c ?? def?.usertype;
  }
}
