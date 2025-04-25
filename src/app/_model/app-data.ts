import {BaseData} from '@/_model/base-data';
import {PersonData} from '@/_model/person-data';
import {PlanData} from '@/_model/plan-data';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {EnumPermission} from '@/_model/user-data';

export enum UserType {
  Admin = 1 << 0,
  Sitter = 1 << 1,
  Owner = 1 << 2
}

export type TypeUser = { label: string, value: UserType, name: string };
export type TypeUserList = { [key: string]: TypeUser };

export class AppData extends BaseData {
// msg: { [key: string]: any[] };
  static UserTypes: TypeUserList =
    {
      admin: {label: $localize`Admin`, value: UserType.Admin, name: 'Admin'},
      owner: {label: $localize`Owner`, value: UserType.Owner, name: 'Owner'},
      sitter: {label: $localize`Sitter`, value: UserType.Sitter, name: 'sitter'}
    }

  usertype: UserType;
  permissions: number[];
  person: PersonData;
  plans: PlanData[];

  constructor(json?: any) {
    super(json);
  }

  get filteredPlans(): PlanData[] {
    return this.plans?.filter(e => GLOBALS.showCompleted || Utils.isOnOrAfter(e.period.end, Utils.now)) ?? [];
  }

  override get _asJson(): any {
    return {
      a: this.person.asJson,
      b: this.mapArrayToJson(this.plans),
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.person = new PersonData(json?.a ?? def?.person);
    this.plans = this.mapArrayToModel(json?.b ?? def?.plans, PlanData);
    this.plans?.sort((a, b) => {
      return a.period.start.getTime() - b.period.start.getTime();
    })
  }

  may(perm: EnumPermission): boolean {
    return this.usertype === UserType.Admin || this.permissions?.indexOf(perm) >= 0;
  }
}
