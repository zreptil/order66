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
  phone: string;
  fkUser: number;
  tasksAsCalendar = false;

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  get fullname(): string {
    const ret = Utils.join([this.firstname, this.lastname], ' ');
    if (Utils.isEmpty(ret)) {
      return null;
    }
    return ret;
  }

  get fullinfo(): string {
    return Utils.join([this.fullname ?? this.email, GLOBALS.currentUsertypes], ' - ');
  }

  get address(): string {
    return Utils.join(
      [Utils.join([this.address1, this.address2], ' '),
        Utils.join([this.zip, this.city], ' ')], ', ');
  }

  override get _asJson(): any {
    return {
      a: this.firstname,
      b: this.lastname,
      c: this.email,
      d: this.address1,
      e: this.address2,
      f: this.zip,
      g: this.city,
      h: this.phone,
      i: this.tasksAsCalendar
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
    this.phone = json?.h ?? def?.phone;
    this.tasksAsCalendar = json?.i ?? def?.tasksAsCalendar;
  }
}
