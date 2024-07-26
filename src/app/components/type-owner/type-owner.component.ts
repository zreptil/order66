import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {PlanComponent} from '@/components/plan/plan.component';
import {PlanData} from '@/_model/plan-data';
import {BackendService} from '@/_services/backend.service';
import {TypeService} from '@/_services/type.service';

@Component({
  selector: 'app-type-owner',
  templateUrl: './type-owner.component.html',
  styleUrls: ['../type.component.scss']
})
export class TypeOwnerComponent implements AfterViewInit {

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService,
              public ts: TypeService) {
  }

  ngAfterViewInit(): void {
  }

  clickAdd(evt: MouseEvent) {
    evt.stopPropagation();
    this.msg.showPopup(PlanComponent, 'plan', new PlanData({0: -1})).subscribe(result => {
      if (result?.btn === 'save') {
        GLOBALS.appData.plans ??= [];
        result.data.id = GLOBALS.appData.plans.length + 1;
        GLOBALS.appData.plans.push(result.data);
        this.bs.saveAppData(GLOBALS.appData,
          (data) => {
            GLOBALS.appData.fillFromJson(data.asJson);
            GLOBALS.appData.usertype = data.usertype;
            GLOBALS.currentUserType = GLOBALS.usertypeList[0];
            GLOBALS.saveSharedData();
            this.msg.closePopup();
          },
          (error) => {
            console.error(error);
            this.msg.error($localize`Error when saving data - ${error}`);
          });
      }
    });
  }
}
