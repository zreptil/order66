import {AfterViewInit, Component} from '@angular/core';
import {GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {TypeService} from '@/_services/type.service';
import {BackendService} from '@/_services/backend.service';
import {EnumPermission, UserData} from '@/_model/user-data';
import {DialogResultButton} from '@/_model/dialog-data';
import {UserType} from '@/_model/app-data';

@Component({
  selector: 'app-type-admin',
  templateUrl: './type-admin.component.html',
  styleUrls: ['../type.component.scss'],
  standalone: false
})
export class TypeAdminComponent implements AfterViewInit {
  userList: UserData[] = [];
  permissionList: any[] = [{
    id: EnumPermission.editCompletedPlans, label: $localize`Edit completed plans`
  }, {
    id: EnumPermission.keepUserToken, label: $localize`Keep token when user logs out`
  }];

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService,
              public ts: TypeService) {
    this.bs.loadUserList((list: UserData[]) => {
      this.userList = list;
    });
  }

  ngAfterViewInit(): void {
  }

  clickDelete(evt: MouseEvent, user: UserData) {
    this.msg.confirm($localize`Are you sure you want to delete user @${user.username}@?`).subscribe({
      next: (result) => {
        if (result?.btn === DialogResultButton.yes) {

        }
      }
    });
  }

  clickResetPwd(evt: MouseEvent, user: UserData) {
    this.msg.confirm($localize`Are you sure you want to reset the password for user @${user.username}@?`).subscribe({
      next: (result) => {
        if (result?.btn === DialogResultButton.yes) {

        }
      }
    });
  }

  isAdmin(user: UserData): boolean {
    return (user.usertype & UserType.Admin) === UserType.Admin;
  }

  togglePermission(user: UserData, permission: number) {
    user.permissions ??= [];
    const idx = user.permissions.indexOf(permission);
    if (idx >= 0) {
      user.permissions.splice(idx, 1);
    } else {
      user.permissions.push(permission);
    }
    this.bs.saveUser(user);
  }
}
