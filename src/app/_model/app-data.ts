import {BaseData} from '@/_model/base-data';
import {PersonData} from '@/_model/person-data';

export class AppData extends BaseData {
  person: PersonData;

  constructor(json?: any) {
    super();
    this.fillFromJson(0, json);
  }

  override get asJson(): any {
    return {
      a: this.person
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.person = new PersonData(json.a);
  }
}
