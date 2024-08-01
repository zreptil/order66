import {BaseData} from '@/_model/base-data';

export class ActionData extends BaseData {
  text: string;
  done: boolean;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.text,
      b: this.done
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.text = json?.a ?? def?.text;
    this.done = json?.b ?? def?.done;
  }
}
