import {BaseData} from '@/_model/base-data';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';

export class PersonData extends BaseData {
  firstname: string;
  lastname: string;
  email: string;
  address1: string;
  address2: string;
  zip: string;
  city: string;

  constructor(id?: number, json?: any) {
    super();
    this.fillFromJson(id ?? 1, json);
  }

  get fullname(): string {
    return Utils.join([this.firstname, this.lastname], ' ');
  }

  get fullinfo(): string {
    return Utils.join([this.fullname, GLOBALS.currentUsertypes], ' - ');
  }

  get address(): string {
    return Utils.join(
      [Utils.join([this.address1, this.address2], ' '),
        Utils.join([this.zip, this.city], ' ')], ', ');
  }

  override get asJson(): any {
    return {
      a: this.firstname,
      b: this.lastname,
      c: this.email,
      d: this.address1,
      e: this.address2,
      f: this.zip,
      g: this.city
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.firstname = json?.a ?? def?.firstname;
    this.lastname = json?.b ?? def?.lastname;
    this.email = json?.c ?? def?.email;
    this.address1 = json?.d ?? def?.address1;
    this.address2 = json?.e ?? def?.address2;
    this.zip = json?.f ?? def?.zip;
    this.city = json?.g ?? def?.city;
  }
}
