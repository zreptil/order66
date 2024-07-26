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
    // const data = new PlanData();
    // data.fillFromJson(plan.plan.asJson);
    this.msg.showPopup(TasksComponent, 'tasks', plan).subscribe(result => {
      if (result?.btn === 'save') {
        this.bs.saveSitterPlan(result.data,
          (_data: SitterPlan) => {
            GLOBALS.loadAppData();
          });
      }
    });
  }
}
