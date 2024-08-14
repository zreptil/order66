import {BaseData} from '@/_model/base-data';
import {ColorData} from '@/_model/color-data';

export class OwnerData extends BaseData {
  colorBack: ColorData;
  colorFore: ColorData;

  constructor(json?: any) {
    super(json);
  }

  override get _asJson(): any {
    return {
      a: this.colorBack.asJson,
      b: this.colorFore.asJson,
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.colorBack = ColorData.fromJson(json?.a ?? def?.colorBack ?? {v: 'ffffff'});
    this.colorFore = ColorData.fromJson(json?.b ?? def?.colorFore ?? {v: '000000'});
  }
}
