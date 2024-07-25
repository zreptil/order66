import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DatepickerData} from '@/controls/datepicker/datepicker-month/datepicker-data';
import {Log} from '@/_services/log.service';
import {MessageService} from '@/_services/message.service';
import {DatepickerDialogComponent} from '@/controls/datepicker/datepicker-dialog/datepicker-dialog.component';
import {Utils} from '@/classes/utils';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss']
})
export class DatepickerComponent implements OnInit {
  @Input()
  firstDayOfWeek = 1;
  @Input()
  showInfo = false;
  @Input()
  showLabel = true;
  @Input()
  msgPeriod = $localize`Period`;
  @Output('save')
  trigger = new EventEmitter<UIEvent>();
  @Output()
  periodChange = new EventEmitter<DatepickerPeriod>();
  data = new DatepickerData();

  constructor(public msg: MessageService) {
    Log.todo('Beim Datepicker müssen noch die Eingabefelder für Start und Ende rein.');
  }

  get classForButton(): string[] {
    const ret = ['dpBtn'];
    if (this.data.period.isEmpty) {
      ret.push('empty');
    }
    return ret;
  }

  get periodLabelMain(): string {
    if (this.data.period == null) {
      return this.msgPeriod;
    }
    return this.data.period.display;
  }

  get periodLabelSub(): string {
    return `(${this.data.period.dowActiveText})`;
  }

  get periodFloatingLabel(): string {
    if (this.data.period.start == null || this.data.period.end == null) {
      return '';
    }
    return this.msgPeriod;
  }

  @Input()
  set period(value: DatepickerPeriod | string) {
    const temp = value instanceof DatepickerPeriod ? value : new DatepickerPeriod(value);
    this.data.period = temp ?? this.data.period;
    if (this.data.period.entryKey != null && this.data.period.list.length > 0) {
      const entry =
        this.data.period.list.find((e: any) => e.key === this.data.period.entryKey);
      entry?.fill(this.data.period);
    }
    this.data.month = Utils.now;
  }

  ngOnInit(): void {
  }

  infoClass(cls: string): string {
    return this.showInfo ? `${cls} infoarea showinfo` : `${cls} infoarea`;
  }

  showDatePicker() {
    this.data.loadedPeriod = this.data.period.toString();
    this.msg.showPopup(DatepickerDialogComponent, 'datepicker', this.data).subscribe(result => {
      switch (result?.btn) {
        case 'save':
          this.period = this.data.period;
          this.periodChange.emit(this.data.period);
          break;
      }
    });
  }
}
