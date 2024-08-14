import {BaseData} from '@/_model/base-data';
import {Utils} from '@/classes/utils';
import {GLOBALS} from '@/_services/globals.service';
import {ImgurData} from '@/_model/imgur-data';
import {OwnerData} from '@/_model/owner-data';
import {SitterPlan} from '@/_services/backend.service';

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
  imgur: ImgurData;
  owners: { [key: string]: OwnerData };

  constructor(json?: any) {
    super(json);
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
    const ret: any = {
      a: this.firstname,
      b: this.lastname,
      c: this.email,
      d: this.address1,
      e: this.address2,
      f: this.zip,
      g: this.city,
      h: this.phone,
      i: this.tasksAsCalendar,
      j: this.imgur.asJson
    };
    ret.k = {};
    for (const key of Object.keys(this.owners)) {
      ret.k[key] = this.owners[key].asJson;
    }
    return ret;
  }

  owner(plan: SitterPlan): OwnerData {
    let ret = this.owners[plan.ui];
    if (ret == null) {
      ret = new OwnerData();
      this.owners[plan.ui] = ret;
    }
    return ret;
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
    this.imgur = new ImgurData(json?.j ?? def?.imgur);
    this.owners = {};
    const src = json?.k ?? def?.owners ?? {};
    for (const key of Object.keys(src)) {
      this.owners[key] = new OwnerData(src[key]);
    }
  }
}
