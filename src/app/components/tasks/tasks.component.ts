import {AfterViewInit, Component, Inject, OnInit} from '@angular/core';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {CloseButtonData} from '@/controls/close-button/close-button-data';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';
import {Utils} from '@/classes/utils';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MessageService} from '@/_services/message.service';
import {SitterPlan} from '@/_services/backend.service';
import {TimeData} from '@/_model/time-data';
import {DayData} from '@/_model/day-data';
import {ActionData} from '@/_model/action-data';
import {DialogResultButton} from '@/_model/dialog-data';
import {EnumPermission} from '@/_model/user-data';
import {UserType} from '@/_model/app-data';
import {ColorDialogData} from '@/controls/color-picker/color-picker.component';
import {ColorData} from '@/_model/color-data';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {PdfService} from '@/_services/pdf.service';
import {DlgBaseComponent} from '@/classes/base/dlg-base-component';

@Component({
  selector: 'app-plan',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  standalone: false
})
export class TasksComponent extends DlgBaseComponent implements OnInit, AfterViewInit {

  closeData: CloseButtonData = {
    viewInfo: this.name,
    colorKey: 'plan',
    showClose: true
  };
  // period: DatepickerPeriod = new DatepickerPeriod();
  weeks: any[];
  readonly DatepickerPeriod = DatepickerPeriod;
  edit = {action: -1, day: -1, time: -1};
  _mayEdit = false;
  initialized = false;
  sitterColors: ColorData[];
  savedColors: any = {};
  protected readonly Utils = Utils;
  protected readonly EnumPermission = EnumPermission;
  protected readonly UserType = UserType;

  constructor(globals: GlobalsService,
              public msg: MessageService,
              public sanitizer: DomSanitizer,
              public pdf: PdfService,
              @Inject(MAT_DIALOG_DATA) public data: SitterPlan) {
    super(globals, 'Tasks');
  }

  get isSitter(): boolean {
    return this.data.pi != null;
  }

  ngOnInit() {
    const owner = GLOBALS.appData.person.owner(this.data);
    const back = owner?.colorBack ?? new ColorData([255, 255, 255]);
    const fore = owner?.colorFore ?? new ColorData([0, 0, 0]);
    this.initColors(back, fore);
    this.savedColors = {
      back: this.sitterColors[0].asJson,
      fore: this.sitterColors[1].asJson
    };
  }

  initColors(back: ColorData, fore: ColorData): void {
    const title = `${$localize`Owner`} ${GLOBALS.ownerName(this.data)}`;
    back.title = title;
    back.subtitle = $localize`Background`;
    back.themeKey = `${GLOBALS.ownerName(this.data)}back`;
    back.isBackColor = true;
    fore.title = title;
    fore.subtitle = $localize`Text`;
    fore.themeKey = `${GLOBALS.ownerName(this.data)}fore`;
    fore.isBackColor = false;
    this.sitterColors = [back, fore];
  }

  isToday(date: Date): boolean {
    return Utils.isToday(date);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initialized = true;
    });
  }

  mayEdit(day?: DayData): boolean {
    if (this._mayEdit) {
      return true;
    }
    let ret: boolean;
    if (day == null) {
      ret = Utils.isOnOrAfter(this.data?.p?.period?.end ?? Utils.now, Utils.now);
    } else {
      ret = Utils.isOnOrAfter(day?.date ?? Utils.now, Utils.now);
    }
    if (ret) {
      ret = !day?.timeRanges?.some(t => t.actions?.some(a => a.done));
    }
    return ret;
  }

  timeDescription(time: TimeData) {
    return Utils.plural(time.actions?.length ?? 0, {
      0: $localize`No Instructions`,
      1: $localize`1 Instruction`,
      other: $localize`${time.actions?.length} Instructions`,
    });
  }

  clickAddAction(evt: MouseEvent, day: DayData, time: TimeData) {
    evt.stopPropagation();
    time.actions ??= [];
    const action = new ActionData({
      0: time.actions.length + 1
    });
    time.actions.push(action);
    this.edit = {action: action.id, day: day.id, time: time.id};
  }

  clickEditAction(evt: MouseEvent, action: ActionData, day: DayData, time: TimeData) {
    evt.stopPropagation();
    if (this.edit.action === action.id && this.edit.time === time.id) {
      this.edit.action = -1;
    } else {
      this.edit = {action: action.id, day: day.id, time: time.id};
    }
  }

  saveImmediate(day: DayData): void {
    GLOBALS.saveImmediate(() => {
      const plan = GLOBALS.appData.plans.find(p => p.id === this.data.p.id);
      if (plan != null) {
        const idx = plan.days.findIndex(d => d.id === day.id);
        if (idx >= 0) {
          plan.days[idx] = day;
        }
      }
    });
  }

  clickDeleteTimeActions(evt: MouseEvent, day: DayData, time: TimeData) {
    evt.stopPropagation();
    const msg = $localize`Do you want to delete all Instructions from ${Utils.fmtDate(day.date)}&nbsp;${time.typeName}?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions = [];
        this.saveImmediate(day);
      }
    });
  }

  clickDeleteAction(evt: MouseEvent, action: ActionData, day: DayData, time: TimeData) {
    evt.stopPropagation();
    const msg = $localize`Do you want to delete this Instruction?`;
    this.msg.confirm(msg).subscribe(result => {
      if (result?.btn === DialogResultButton.yes) {
        time.actions.splice(time.actions.findIndex(a => a.id === action.id), 1);
        this.saveImmediate(day);
      }
    });
  }

  clickCopyAction(evt: MouseEvent, day: DayData, time: TimeData) {
    evt.stopPropagation();
    if (time == null) {
      for (const time of day.timeRanges) {
        this.clickCopyAction(evt, day, time);
      }
      return;
    }
    if (day.id > 1) {
      const yesterday = this.data.p.days.find(d => d.id === day.id - 1);
      if (yesterday != null) {
        time.actions = yesterday.timeRanges.find(t => t.type === time.type)?.actions?.map(a => {
          const ret = new ActionData();
          ret.fillFromJson(a.asJson);
          ret.done = false;
          return ret;
        });
      }
    } else if (this.data.p.id > 1) {
      const lastPlan = GLOBALS.appData.plans.find(p => p.id === this.data.p.id - 1);
      if (lastPlan != null) {
        const lastDay = lastPlan.days.reverse().find(d => d.timeRanges.some(t => t.type === time.type));
        if (lastDay != null) {
          time.actions = lastDay.timeRanges
            .find(t => t.type === time.type)?.actions?.map(a => {
              const ret = new ActionData();
              ret.fillFromJson(a.asJson);
              ret.done = false;
              return ret;
            });
        }
      }
    }
  }

  classForDone(action: ActionData, day: DayData): string[] {
    const ret: string[] = ['check'];
    if (action.done) {
      ret.push('done');
    } else if (!this.isToday(day.date)) {
      ret.push('notdone');
    }
    return ret;
  }

  msgCopy(day: DayData): string {
    if (day?.id > 1) {
      return $localize`Copy from previous Day`;
    }
    return $localize`Copy from previous Plan`;
  }

  isDayExpanded(day: DayData): boolean {
    if (!this.isSitter) {
      if (Utils.isBetween(Utils.now, this.data.p.period.start, this.data.p.period.end)) {
        return Utils.isSameDay(day.date, Utils.now);
      }
      return true;
    }
    return Utils.isSameDay(day.date, Utils.now);
  }

  isTimeExpanded(day: DayData, time: TimeData) {
    const now = Utils.now;
    if ((day as any).forceOpen) {
      return true;
    }
    if (!this.initialized) {
      if (Utils.isBeforeDate(day.date, now)) {
        return true;
      } else if (Utils.isSameDay(day.date, now)) {
        return time.actions.some(e => !(e.done ?? false));
      }
      // switch (time.type) {
      //   case TimeType.morning:
      //     return now.getHours() < 12;
      //   case TimeType.evening:
      //     return now.getHours() >= 12;
      //   case TimeType.eventually:
      //     return true;
      // }
    }
    return !this.isSitter;
  }

  expandDay(isOpen: boolean, day: DayData) {
    if (this.initialized) {
      (day as any).forceOpen = isOpen;
    }
  }

  iconForDone(action: ActionData, day: DayData) {
    return day?.iconForDone(action) ?? 'close';
  }

  timeInfo(time: TimeData) {
    let ret = time?.info;
    ret = ret.replace(/\n/g, '<br>');
    return ret;
  }

  classForDay(day: DayData): string[] {
    const ret: string[] = [];
    if (Utils.isToday(day.date)) {
      ret.push('current');
    }
    return ret;

  }

  clickActionMove(evt: MouseEvent, day: DayData, action: ActionData, time: TimeData) {
    const idx = time.actions.findIndex(e => e.id === action.id);
    if (idx >= 0) {
      time.actions.splice(idx, 1);
      time.actions.splice(idx + 1, 0, action);
    }
  }

  onColorPicker(data: ColorDialogData) {
    const color = data.colorList[data.colorIdx];
    switch (data.action) {
      case 'colorChange': {
        const owner = GLOBALS.appData.person.owner(this.data);
        switch (color.themeKey) {
          case `${GLOBALS.ownerName(this.data)}back`:
            owner.colorBack = color;
            break;
          case `${GLOBALS.ownerName(this.data)}fore`:
            owner.colorFore = color;
            break;
        }
        this.initColors(owner.colorBack, owner.colorFore);
        GLOBALS._styleForPanels[this.data.ui] = null;
        break;
      }
      case 'mode-hsl':
        break;
      case 'close': {
        const owner = GLOBALS.appData.person.owner(this.data);
        owner.colorBack = ColorData.fromJson(this.savedColors.back);
        owner.colorFore = ColorData.fromJson(this.savedColors.fore);
        this.initColors(owner.colorBack, owner.colorFore);
        GLOBALS._styleForPanels[this.data.ui] = null;
        break;
      }
      case 'closeOk':
        const owner = GLOBALS.appData.person.owner(this.data);
        this.initColors(owner.colorBack, owner.colorFore);
        console.log(this.sitterColors);
        GLOBALS.saveImmediate();
        GLOBALS._styleForPanels[this.data.ui] = null;
        break;
      default:
        //console.log(data.action);
        break;
    }
  }

  actionText(action: ActionData): SafeHtml {
    const ret: string[] = [`<div>${action.text}</div>`];
    if (GLOBALS.isDebug && action.created != null) {
      ret.push(`<div actiontime>(${Utils.fmtDateTime(new Date(action.created))})</div>`);
    }
    return this.sanitizer.bypassSecurityTrustHtml(`${Utils.join(ret, '')}`);
  }

  classForAction(action: ActionData): string[] {
    const ret: string[] = ['action'];
    if (this.isSitter && Utils.isSameDay(Utils.now, new Date(action.created))) {
      ret.push('add');
    }
    return ret;
  }

  clickPdf(evt: MouseEvent) {
    evt.stopPropagation();
    this.pdf.generateSitterPlan(this.data.p);
  }
}
