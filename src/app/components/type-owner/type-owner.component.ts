import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {PlanComponent} from '@/components/plan/plan.component';
import {PlanData} from '@/_model/plan-data';
import {BackendService} from '@/_services/backend.service';
import {TypeService} from '@/_services/type.service';
import {PdfService} from '@/_services/pdf.service';
import {Utils} from '@/classes/utils';
import {UserType} from '@/_model/app-data';

@Component({
  selector: 'app-type-owner',
  templateUrl: './type-owner.component.html',
  styleUrls: ['../type.component.scss'],
  standalone: false
})
export class TypeOwnerComponent implements AfterViewInit {

  protected readonly Utils = Utils;
  protected readonly UserType = UserType;

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService,
              public ts: TypeService,
              public pdf: PdfService,
              public cr: ChangeDetectorRef) {
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

  styleForCard(plan: PlanData): any {
    const ret: any = {};
    if (plan.past > 3) {
      ret.opacity = 0.5; //Math.max(1 - (plan.past / 14), 0.1);
    }
    return ret;
  }

  clickPdf(evt: MouseEvent, plan: PlanData) {
    evt.stopPropagation();
    this.pdf.generateSitterPlan(plan);
  }
}
