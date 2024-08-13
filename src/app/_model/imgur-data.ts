import {BaseData} from '@/_model/base-data';

export class ImgurData extends BaseData {
  at: string; // access_token
  ai: string; // account_id
  au: string; // account_username
  ei: string; // expires_in
  rt: string; // refresh_token
  tt: string; // token_type

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.at,
      b: this.ai,
      c: this.au,
      d: this.ei,
      e: this.rt,
      f: this.tt
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.at = json?.a ?? def?.at;
    this.ai = json?.b ?? def?.ai;
    this.au = json?.c ?? def?.au;
    this.ei = json?.d ?? def?.ei;
    this.rt = json?.e ?? def?.rt;
    this.tt = json?.f ?? def?.tt;
  }
}

