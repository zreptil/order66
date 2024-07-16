import {BaseData} from '@/_model/base-data';

export class UserData extends BaseData {
  firstname: string;
  lastname: string;
  email: string;
  street: string;
  streetNo: string;
  zip: string;
  city: string;

  override get asJson(): any {
    return {
      a: this.firstname,
      b: this.lastname,
      c: this.email,
      d: this.street,
      e: this.streetNo,
      f: this.zip,
      g: this.city
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.firstname = json.a ?? def?.firstname;
    this.lastname = json.b ?? def?.lastname;
    this.email = json.c ?? def?.email;
    this.street = json.d ?? def?.street;
    this.streetNo = json.e ?? def?.streetNo;
    this.zip = json.f ?? def?.zip;
    this.city = json.g ?? def?.city;
  }
}
