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

@Component({
  selector: 'app-type-sitter',
  templateUrl: './type-sitter.component.html',
  styleUrls: ['../type.component.scss']
})
export class TypeSitterComponent implements AfterViewInit {

  _planList: SitterPlan[];

  constructor(public globals: GlobalsService,
              public bs: BackendService,
              public msg: MessageService,
              public ts: TypeService) {
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
    return this._planList?.filter(e => GLOBALS.showCompleted || Utils.isAfter(e.p.period.end, Utils.now)) ?? [];
  }

  get now(): Date {
    return Utils.now;
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
//    const check = new Date(2024, 7, 9).getTime();
    const check = new Date().getTime();
    const start = plan.p.period.start.getTime();
    const end = plan.p.period.end.getTime();
    if (diff < 0) {
      return check < start;
    }
    if (diff > 0) {
      return check > end;
    }
    return check >= start && check <= end;
  }

  isTimeRangeDone(time: TimeData) {
    return !time.actions.some((e: ActionData) => !(e.done ?? false));
  }

  isPast(day: DayData) {
    return Utils.isBeforeDate(day.date, Utils.now);
  }
}
