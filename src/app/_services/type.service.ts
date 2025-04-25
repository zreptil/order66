import {Injectable} from '@angular/core';
import {PlanData} from '@/_model/plan-data';
import {PlanComponent} from '@/components/plan/plan.component';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {DialogResultButton} from '@/_model/dialog-data';
import {MessageService} from '@/_services/message.service';
import {Utils} from '@/classes/utils';

@Injectable({
  providedIn: 'root'
})
export class TypeService {

  constructor(public globals: GlobalsService,
              public msg: MessageService) {
  }

  clickPlan(plan: PlanData) {
    const data = new PlanData();
    data.fillFromJson(plan.asJson);
    this.msg.showPopup(PlanComponent, 'plan', data).subscribe(result => {
      if (result?.btn === 'save') {
        const idx = GLOBALS.appData.plans.findIndex(entry => +entry.id === +plan.id);
        if (idx >= 0) {
          GLOBALS.appData.plans[idx].fillFromJson(result.data.asJson);
          GLOBALS.saveImmediate(() => {
          }, () => {
            this.msg.closePopup()
          });
        }
      } else if (result?.btn === 'delete') {
        this.msg.confirm($localize`Do you want to delete this plan?`).subscribe(result => {
          if (result?.btn === DialogResultButton.yes) {
            const idx = GLOBALS.appData.plans.findIndex(entry => +entry.id === +plan.id);
            if (idx >= 0) {
              GLOBALS.appData.plans.splice(idx, 1);
              GLOBALS.saveImmediate();
            }
          }
        });
      }
    });
  }

  isTime(plan: PlanData, diff: number) {
    const check = Utils.now;
    const start = plan.period.start;
    const end = plan.period.end;
    if (diff < 0) {
      return Utils.isBeforeDate(check, start);
    }
    if (diff > 0) {
      return Utils.isAfterDate(check, end);
    }
    return Utils.isOnOrAfterDate(check, start) && Utils.isOnOrBeforeDate(check, end);
  }
}
