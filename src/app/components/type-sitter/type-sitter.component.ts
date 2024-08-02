import {AfterViewInit, Component} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {MessageService} from '@/_services/message.service';
import {TypeService} from '@/_services/type.service';
import {BackendService, SitterPlan} from '@/_services/backend.service';
import {TasksComponent} from '@/components/tasks/tasks.component';

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
    return this._planList ?? [];
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
}
