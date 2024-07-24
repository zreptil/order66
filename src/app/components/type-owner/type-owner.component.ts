import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {PlanComponent} from '@/components/plan/plan.component';
import {PlanData} from '@/_model/plan-data';
import {BackendService} from '@/_services/backend.service';
import {DialogResultButton} from '@/_model/dialog-data';

@Component({
  selector: 'app-type-owner',
  templateUrl: './type-owner.component.html',
  styleUrls: ['./type-owner.component.scss']
})
export class TypeOwnerComponent implements AfterViewInit {

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService) {
  }

  ngAfterViewInit(): void {
  }

  clickAdd(evt: MouseEvent) {
    evt.stopPropagation();
    this.msg.showPopup(PlanComponent, 'plan', new PlanData()).subscribe(result => {
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

  clickPlan(plan: PlanData) {
    const data = new PlanData();
    data.fillFromJson(plan.asJson);
    this.msg.showPopup(PlanComponent, 'plan', data).subscribe(result => {
      if (result?.btn === 'save') {
        plan.fillFromJson(result.data.asJson);
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

  clickDelete(evt: MouseEvent, plan: PlanData) {
    evt.stopPropagation();
    this.msg.confirm($localize`Are you sure you want to delete this plan?`).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        const idx = GLOBALS.appData.plans.findIndex(entry => +entry.id === +plan.id);
        if (idx >= 0) {
          GLOBALS.appData.plans.splice(idx, 1);
          this.bs.saveAppData(GLOBALS.appData,
            (data) => {
              GLOBALS.appData.fillFromJson(data.asJson);
              GLOBALS.appData.usertype = data.usertype;
              GLOBALS.currentUserType = GLOBALS.usertypeList[0];
              GLOBALS.saveSharedData();
            },
            (error) => {
              console.error(error);
              this.msg.error($localize`Error when saving data - ${error}`);
            });
        }
      }
    });
  }
}
