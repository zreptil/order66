import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {TypeService} from '@/_services/type.service';
import {BackendService, SitterPlan} from '@/_services/backend.service';
import {TasksComponent} from '@/components/tasks/tasks.component';
import {ActionData} from '@/_model/action-data';
import {TimeData} from '@/_model/time-data';
import {DayData} from '@/_model/day-data';
import {Utils} from '@/classes/utils';
import {CalendarOptions, GoogleLinkService, GoogleMapsOptions} from '@/_services/google-link.service';
import {PlanData} from '@/_model/plan-data';
import {PdfService} from '@/_services/pdf.service';

@Component({
  selector: 'app-type-sitter',
  templateUrl: './type-sitter.component.html',
  styleUrls: ['../type.component.scss']
})
export class TypeSitterComponent implements AfterViewInit {

  _planList: SitterPlan[];
  protected readonly Utils = Utils;

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService,
              public ts: TypeService,
              public gas: GoogleLinkService,
              public pdf: PdfService) {
  }

  get plans(): SitterPlan[] {
    if (this._planList == null) {
      this.bs.getSitterPlans(
        (list: SitterPlan[]) => {
          this._planList = list;
        }, (_error) => {
          this._planList = [];
        });
    }
    return this._planList?.filter(e => GLOBALS.showCompleted || Utils.isOnOrAfter(e.p.period.end, Utils.now)) ?? [];
  }

  get now(): Date {
    return Utils.now;
  }

  editStatusInfo(plan: PlanData): boolean {
    return (plan as any).editStatusInfo;
  }

  gasOptions(plan: SitterPlan): GoogleMapsOptions {
    const owner = GLOBALS.owner(plan);

    return {
      address: `${owner.address}`,
      height: 100
    }
  }

  planId(plan: SitterPlan): string {
    return `${plan.ui}-${plan.p.id}`;
  }

  ngAfterViewInit(): void {
  }

  clickPlan(plan: SitterPlan) {
    this.msg.showPopup(TasksComponent, 'tasks', plan).subscribe(result => {
      if (result?.btn === 'save') {
        this.bs.saveSitterPlan(result.data,
          (_data: SitterPlan) => {
            GLOBALS.loadAppData();
          });
      } else {
        this._planList = null;
      }
    });
  }

  classForPlan(plan: SitterPlan): string[] {
    const ret: string[] = [];
    const check = new Date(2024, 7, 9).getTime();
    const start = plan.p.period.start.getTime();
    const end = plan.p.period.end.getTime();
    if (check >= start && check <= end) {
      ret.push('current');
    }
    return ret;
  }

  isTime(plan: SitterPlan, diff: number) {
    const check = Utils.now;
    const start = plan.p.period.start;
    const end = plan.p.period.end;
    if (diff < 0) {
      return Utils.isBeforeDate(check, start);
    }
    if (diff > 0) {
      return Utils.isAfterDate(check, end);
    }
    return Utils.isOnOrAfterDate(check, start) && Utils.isOnOrBeforeDate(check, end);
  }

  isTimeRangeDone(time: TimeData) {
    return !time.actions.some((e: ActionData) => !(e.done ?? false));
  }

  isPast(day: DayData) {
    return Utils.isBeforeDate(day.date, Utils.now);
  }

  clickMap(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    const from = GLOBALS.appData.person.address;
    const to = GLOBALS.owner(plan).address;
    GLOBALS.openLink(this.gas.mapsRouteUrl(from, to));
  }

  clickCalendarAdd(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    const options: CalendarOptions = {
      title: $localize`Animal care at ${GLOBALS.owner(plan).address}`,
      from: Utils.fmtDate(plan.p.period.start, 'yyyyMMdd'),
      to: Utils.fmtDate(Utils.addDateDays(plan.p.period.end, 1), 'yyyyMMdd'),
      details: '',
      location: GLOBALS.owner(plan).address
    };
    GLOBALS.openLink(this.gas.calendarAddEntryUrl(options));
  }

  clickCalendarShow(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    GLOBALS.openLink(this.gas.calendarShowUrl(plan.p.period.start));
  }

  clickPdf(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    this.pdf.generateSitterPlan(plan.p);
  }

  clickStatus(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    plan.p.status = 1 - (plan.p.status ?? 0);
    this.bs.saveSitterPlan(plan,
      (_data: SitterPlan) => {
        GLOBALS.loadAppData();
      });
  }

  clickStatusInfo(evt: MouseEvent, plan: PlanData) {
    evt.stopPropagation();
    (plan as any).editStatusInfo = true;
  }

  clickSaveStatusInfo(evt: MouseEvent, plan: SitterPlan) {
    evt.stopPropagation();
    this.bs.saveSitterPlan(plan,
      (_data: SitterPlan) => {
        GLOBALS.loadAppData();
      });
  }
}
