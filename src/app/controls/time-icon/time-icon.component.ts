import {Component, Input} from '@angular/core';
import {TimeData} from '@/_model/time-data';
import {DayData} from '@/_model/day-data';
import {ActionData} from '@/_model/action-data';
import {Utils} from '@/classes/utils';

@Component({
  selector: 'app-time-icon',
  templateUrl: './time-icon.component.html',
  styleUrl: './time-icon.component.scss'
})
export class TimeIconComponent {
  @Input() day: DayData;
  @Input() time: TimeData;
  @Input() hideOnEmptyActions = false;

  isTimeRangeDone(time: TimeData) {
    return !time.actions.some((e: ActionData) => !(e.done ?? false));
  }

  isPast(day: DayData) {
    return Utils.isBeforeDate(day.date, Utils.now);
  }
}
