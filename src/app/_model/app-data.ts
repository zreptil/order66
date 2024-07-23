import {BaseData} from '@/_model/base-data';
import {PersonData} from '@/_model/person-data';

export enum UserType {
  Admin = 1 << 0,
  Sitter = 1 << 1,
  Owner = 1 << 2
}

export type TypeUser = { label: string, value: UserType };
export type TypeUserList = { [key: string]: TypeUser };

export class AppData extends BaseData {
// msg: { [key: string]: any[] };
  static UserTypes: TypeUserList =
    {
      admin: {label: $localize`Admin`, value: UserType.Admin},
      owner: {label: $localize`Owner`, value: UserType.Owner},
      sitter: {label: $localize`Sitter`, value: UserType.Sitter}
    }

  usertype: UserType;
  permissions: string[];
  person: PersonData;

  constructor(json?: any) {
    super();
    this.fillFromJson(json);
  }

  override get asJson(): any {
    return {
      a: this.person.asJson
    };
  }

  override _fillFromJson(json: any, def?: any): void {
    this.person = new PersonData(json?.a);
  }
}
