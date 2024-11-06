import {FormConfig} from '@/forms/form-config';
import {GLOBALS} from '@/_services/globals.service';
import {Utils} from '@/classes/utils';
import {ParamInfo} from '@/_model/param-info';
import {LegendData, PageData} from '@/_model/page-data';
import {ReportData} from '@/_model/report-data';
import {PdfService} from '@/_services/pdf.service';
import {map, Observable} from 'rxjs';

export class StepData {
  constructor(public min: number, public step: number) {
  }
}

export class SubNeeded {
  constructor(public current: boolean, public anybody: boolean) {
  }

  get needed(): boolean {
    return this.current || this.anybody;
  }

  mix(src: SubNeeded): void {
    this.current ||= src.current;
    this.anybody ||= src.anybody;
  }
}

export class DataNeeded {
  status = new SubNeeded(false, false);
  data = new SubNeeded(true, false);

  constructor(statusCurr = false, statusAny = false, dataCurr = true, dataAny = false) {
    this.status.current = statusCurr;
    this.status.anybody = statusAny;
    this.data.current = dataCurr;
    this.data.anybody = dataAny;
  }

  get needsStatus(): boolean {
    return this.status.needed;
  }

  get needsData(): boolean {
    return this.data.needed;
  }

  mix(src: DataNeeded): void {
    this.status.mix(src.status);
    this.data.mix(src.data);
  }
}

class HelpItem {
  constructor(public type: string, public text: string, public cfg?: FormConfig) {
  }
}

export abstract class BasePrint extends FormConfig {
  baseId: string;
  baseIdx: string;
  suffix = '-';
  subtitle: string = null; // must not be undefined else the output will be invalid
  needed = new DataNeeded();
  help: string;
  titleInfo: string;
  titleInfoSub = '';
  footerTextAboveLine = {x: 0, y: 0, fs: 12, text: ''};
  pagesPerSheet = 1;
  params: ParamInfo[] = [];
  colors = {
    colText: '#008800',
    colInfo: '#606060',
    colSubTitle: '#a0a0a0',
    colLine: '#606060',
    colValue: '#000000',
    colBasalProfile: '#0097a7',
    colBasalFont: '#fff',
    colProfileSwitch: '#8080c0',
    colBolus: '#0060c0',
    colBolusExt: '#60c0ff',
    colCarbBolus: '#c000c0',
    colLow: '#ff6666',
    colNormLow: '#809933',
    colNorm: '#00cc00',
    colNormHigh: '#aacc00',
    colHigh: '#cccc00',
    colTargetArea: '#00a000',
    colTargetValue: '#3333aa',
    colCarbs: '#ffa050',
    colCarbsText: '#ff6f00',
    colDurationNotes: '#ff00ff',
    colDurationNotesLine: '#ff50ff',
    colNotes: '#000000',
    colNotesLine: '#666666',
    colGlucValues: '#000000',
    colBloodValues: '#ff0000',
    colHbA1c: '#505050',
    colWeekDays: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d'],
    colWeekDaysText: ['#ffffff', '#ffffff', '#000000', '#ffffff', '#ffffff', '#000000', '#ffffff'],
    colExercises: '#c0c0c0',
    colExerciseText: '#000000',
    colTempOverrides: '#f8f',
    colTempOverridesText: '#000000',
    colCGPLine: '#a0a0a0',
    colCGPHealthyLine: '#008000',
    colCGPHealthyFill: '#00e000',
    colCGPPatientLine: '#808000',
    colCGPPatientFill: '#e0e000',
    colIOBFill: '#a0a0ff',
    colIOBLine: '#a0a0ff',
    colCOBFill: '#ffa050',
    colCOBLine: '#ffa050',
    colTrendCrit: '#f59595',
    colTrendWarn: '#f2f595',
    colTrendNorm: '#98f595',
    colCOBDaily: '#ffe090',
    colIOBDaily: '#d0d0ff',
    colWarning: '#ff0000'
  };
  xorg = 3.35;
  yorg = 3.9;
  xframe = 2.2;
  lw = 0.03;
  lc = '#c0c0c0';
  lcFrame = '#000000';
  isPortraitParam = true;
  _pages: PageData[] = [];
  _fileSize = 0;
  scale = 1.0;
  offsetX = 0.0;
  offsetY = 0.0;
  tableHeadFilled = false;
  tableHeadLine: any[] = [];
  tableWidths: any[] = [];
  m0: any[] = [];
  repData: ReportData;
  images: { [key: string]: string } = {};
  // true if there is a page for every selected device for glucosevalues
  hasDevicePages = false;

  protected constructor(public ps: PdfService) {
    super(null, false);
    this.form = this;
  }

  static get msgOutput(): string {
    return $localize`Ausgabe`;
  };

  static get msgGraphic(): string {
    return $localize`Grafik`;
  };

  static get msgTable(): string {
    return $localize`Tabelle`;
  };

  static get msgAll(): string {
    return $localize`Alles`;
  };

  static get titleGPD(): string {
    return $localize`Glukose Perzentil Diagramm`;
  };

  static get titleGPDShort(): string {
    return $localize`GPD`;
  };

  static get msgHourlyStats(): string {
    return $localize`Stündliche Statistik`;
  };

  static get msgUseDailyBasalrate(): string {
    return $localize`Tagesbasalrate verwenden`;
  };

  static get msgGraphsPerPage(): string {
    return $localize`Grafiken pro Seite`;
  }

  static get msgOverrides(): string {
    return $localize`Temporäre Overrides`;
  }

  static get msgOrientation(): string {
    return $localize`Ausrichtung`;
  }

  static get msgChange(): string {
    return $localize`Wechsel`;
  }

  static get msgDay(): string {
    return $localize`Tag (08:00 - 17:59)`;
  }

  static get msgDawn(): string {
    return $localize`Dämmerung (06:00 - 07:59, 18:00 - 20:59)`;
  }

  static get msgNight(): string {
    return $localize`Nacht (21:00 - 05:59)`;
  }

  get isVisible(): boolean {
    if (this.isDebugOnly && !GLOBALS.isDebug) {
      return false;
    }
    if (this.isLocalOnly && !GLOBALS.isLocal) {
      return false;
    }
    // noinspection RedundantIfStatementJS
    if (this.isBetaOrLocal && !GLOBALS.isLocal) {
      return false;
    }

    return true;
  }

  abstract get title(): string;

  override get id(): string {
    return `${this.baseId}${this.suffix}`;
  }

  override get dataId(): string {
    return `${this.baseId}${this.suffix === '-' ? '' : this.suffix}`;
  }

  override get idx(): string {
    return `${this.baseIdx}${this.suffix}`;
  }

  get helpStrings(): HelpItem[] {
    const ret: HelpItem[] = [];
    let text = this.help?.replace(/\n/g, 'µ') ?? '';
    text = text.replace(/µµ/g, '<br><br>');
    text = text.replace(/µ/g, ' ');
    let pos = text.indexOf('@');
    while (pos >= 0) {
      if (pos > 0) {
        ret.push(new HelpItem('text', text.substring(0, pos)));
        text = text.substring(pos);
        pos = 0;
      }
      text = text.substring(1);
      const pos1 = text.indexOf('@');
      if (pos1 >= 0) {
        const id = text.substring(0, pos1);
        const cfg = GLOBALS.listConfig.find((cfg) => cfg.form.baseIdx === id);
        if (cfg != null) {
          ret.push(new HelpItem('btn', cfg.form.title, cfg));
        }
        text = text.substring(pos1 + 1);
      }
      pos = text.indexOf('@');
    }
    if (!Utils.isEmpty(text)) {
      ret.push(new HelpItem('text', text));
    }
    return ret;
  }

  get display(): string {
    let ret = this.title;
    if (this.isLocalOnly) {
      ret = `${ret} (local)`;
    }
    if (this.suffix !== '-') {
      ret = `${ret} ${+this.suffix + 1}`;
    }
    return ret;
  }

  get isLocalOnly(): boolean {
    return false;
  }

  get isDebugOnly(): boolean {
    return false;
  }

  get isBetaOrLocal(): boolean {
    return false;
  }

  get backsuffix(): string {
    return '';
  }

  get backimage(): string {
    this.extractParams();
    return `assets/img/thumbs/${GLOBALS.language.img}/${this.baseId}${this.backsuffix === '' ? '' : `-${this.backsuffix}`}.png`;
  }

  get sortedParams(): ParamInfo[] {
    const ret: ParamInfo[] = [];
    Utils.pushAll(ret, this.params.filter((p) => !p.isDeprecated))
    ret.sort((a, b) => Utils.compare(a.sort, b.sort));
    return ret;
  }

  get colText(): string {
    return this.colors['colText'];
  }

  get colInfo(): string {
    return this.colors['colInfo'];
  }

  get colSubTitle(): string {
    return this.colors['colSubTitle'];
  }

  get colLine(): string {
    return this.colors['colLine'];
  }

  get colValue(): string {
    return this.colors['colValue'];
  }

  get colBasalProfile(): string {
    return this.colors['colBasalProfile'];
  }

  get colBasalDay(): string {
    return this.blendColor(this.colBasalProfile, '#ffffff', 0.5);
  }

  get colBasalFont(): string {
    return this.colors['colBasalFont'];
  }

  get colProfileSwitch(): string {
    return this.colors['colProfileSwitch'];
  }

  get colBolus(): string {
    return this.colors['colBolus'];
  }

  get colBolusExt(): string {
    return this.colors['colBolusExt'];
  }

  get colCarbBolus(): string {
    return this.colors['colCarbBolus'];
  }

  get colLow(): string {
    return this.colors['colLow'];
  }

  get colNormLow(): string {
    return this.colors['colNormLow'];
  }

  get colNorm(): string {
    return this.colors['colNorm'];
  }

  get colNormHigh(): string {
    return this.colors['colNormHigh'];
  }

  get colHigh(): string {
    return this.colors['colHigh'];
  }

  get colLowBack(): string {
    return this.blendColor(this.colLow, '#ffffff', 0.4);
  }

  get colNormLowBack(): string {
    return this.blendColor(this.colNormLow, '#ffffff', 0.4);
  }

  get colNormBack(): string {
    return this.blendColor(this.colNorm, '#ffffff', 0.4);
  }

  get colNormHighBack(): string {
    return this.blendColor(this.colNormHigh, '#ffffff', 0.4);
  }

  get colHighBack(): string {
    return this.blendColor(this.colHigh, '#ffffff', 0.4);
  }

  get colTargetArea(): string {
    return this.colors['colTargetArea'];
  }

  get colTargetValue(): string {
    return this.colors['colTargetValue'];
  }

  get colCarbs(): string {
    return this.colors['colCarbs'];
  }

  get colCarbsText(): string {
    return this.colors['colCarbsText'];
  }

  get colDurationNotes(): string {
    return this.colors['colDurationNotes'];
  }

  get colDurationNotesLine(): string {
    return this.colors['colDurationNotesLine'];
  }

  get colNotes(): string {
    return this.colors['colNotes'];
  }

  get colNotesLine(): string {
    return this.colors['colNotesLine'];
  }

  get colGlucValues(): string {
    return this.colors['colGlucValues'];
  }

  get colBloodValues(): string {
    return this.colors['colBloodValues'];
  }

  get colHbA1c(): string {
    return this.colors['colHbA1c'];
  }

  get colWeekDays(): string[] {
    return this.colors['colWeekDays'];
  }

  get colWeekDaysText(): string[] {
    return this.colors['colWeekDaysText'];
  }

  get colExercises(): string {
    return this.colors['colExercises'];
  }

  get colExerciseText(): string {
    return this.colors['colExerciseText'];
  }

  get colTempOverrides(): string {
    return this.colors['colTempOverrides'];
  }

  get colTempOverridesText(): string {
    return this.colors['colTempOverridesText'];
  }

  get colCGPLine(): string {
    return this.colors['colCGPLine'];
  }

  get colCGPHealthyLine(): string {
    return this.colors['colCGPHealthyLine'];
  }

  get colCGPHealthyFill(): string {
    return this.colors['colCGPHealthyFill'];
  }

  get colCGPPatientLine(): string {
    return this.colors['colCGPPatientLine'];
  }

  get colCGPPatientFill(): string {
    return this.colors['colCGPPatientFill'];
  }

  get colIOBFill(): string {
    return this.colors['colIOBFill'];
  }

  get colIOBLine(): string {
    return this.colors['colIOBLine'];
  }

  get colCOBFill(): string {
    return this.colors['colCOBFill'];
  }

  get colCOBLine(): string {
    return this.colors['colCOBLine'];
  }

  get colTrendCrit(): string {
    return this.colors['colTrendCrit'];
  }

  get colTrendWarn(): string {
    return this.colors['colTrendWarn'];
  }

  get colTrendNorm(): string {
    return this.colors['colTrendNorm'];
  }

  get colCOBDaily(): string {
    return this.colors['colCOBDaily'];
  }

  get colIOBDaily(): string {
    return this.colors['colIOBDaily'];
  }

  get colWarning(): string {
    return this.colors['colWarning'];
  }

  _isPortrait = true;

  get isPortrait(): boolean {
    return this._isPortrait;
  }

  public set isPortrait(value: boolean) {
    this._isPortrait = value;
  }

  //String _hba1c(double avgGluc)
  //=> g.fmtNumber((avgGluc + 86) / 33.3, 1, false);
  //(avgGluc / 18.02 + 2.645) / 1.649;

  get width(): number {
    return this.isPortrait ? 21.0 : 29.7;
  }

  get height(): number {
    return this.isPortrait ? 29.7 : 21.0;
  }

  abstract get estimatePageCount(): any;

  get msgMissingData(): string {
    return $localize`Es sind keine Daten für den Ausdruck vorhanden`;
  }

  get msgServerNotReachable(): string {
    return 'Url not reachable'; // GLOBALS.msgUrlFailure('')?.msg.replace('<br>', '\n');
  }

  get footerText(): any {
    return null;
  }

  get footerTextDayTimes(): any {
    return [
      {
        table: {
          widths: [this.cm(6.0)],
          body: [
            [
              {text: BasePrint.msgDay, style: 'timeDay', alignment: 'center'}
            ],
            [
              {text: BasePrint.msgDawn, style: 'timeLate', alignment: 'center'}
            ],
            [
              {text: BasePrint.msgNight, style: 'timeNight', alignment: 'center'}
            ]
          ]
        },
        fontSize: this.fs(7),
        layout: 'noBorders'
      }
    ];
  }

  get imgList(): string[] {
    return [];
  }

  get msgBasalInsulin(): string {
    return $localize`Basal Insulin`;
  }

  static msgTimeOfDay24(time: string): string {
    return $localize`${time} Uhr`;
  }

  static msgTimeOfDayAM(time: string): string {
    return $localize`${time} am`;
  }

  static msgTimeOfDayPM(time: string): string {
    return $localize`${time} pm`;
  }

  mm(pt: number): number {
    return pt / 0.35277;
  }

  cm(pt: number): number {
    return isNaN(pt) ? 0 : pt / 0.035277 * this.scale;
  }

  cmx(pt: number): number {
    return this.cm(this.offsetX + pt);
  }

  cmy(pt: number): number {
    return this.cm(this.offsetY + pt);
  }

  fs(size: number): number {
    return size * this.scale;
  }

  blendColor(from: string, to: string, factor: number): string {
    if (from.length === 7) {
      from = from.substring(1);
    }
    if (to.length === 7) {
      to = to.substring(1);
    }
    const rf = parseInt(from.substring(0, 2) ?? '0', 16);
    const gf = parseInt(from.substring(2, 4) ?? '0', 16);
    const bf = parseInt(from.substring(4, 6) ?? '0', 16);
    const rt = parseInt(to.substring(0, 2) ?? '0', 16);
    const gt = parseInt(to.substring(2, 4) ?? '0', 16);
    const bt = parseInt(to.substring(4, 6) ?? '0', 16);

    const r = Math.floor(rf + (rt - rf) * factor);
    const g = Math.floor(gf + (gt - gf) * factor);
    const b = Math.floor(bf + (bt - bf) * factor);

    return `#${this.radixString(r)}${this.radixString(g)}${this.radixString(b)}`;
  }

  radixString(value: number): string {
    let ret = (value ?? 0).toString(16);
    while (ret.length < 2) {
      ret = `0${ret}`;
    }
    return ret;
  }

  checkValue(_: ParamInfo, __: any): void {
  }

  headerFooter(params?: { skipFooter?: boolean, date?: Date }): any {
    params ??= {};
    params.skipFooter ??= false;
    const isInput = false;
    const stack: any[] = [];
    const ret = {stack: stack, 'pageBreak': ''};
    // header
    if (this.isPortrait) {
      if (isInput) {
        stack.push({
          'relativePosition': {'x': this.cm(0), 'y': this.cm(0)},
          'canvas': [
            {type: 'rect', x: this.cm(0.0), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#d69a2e'},
            {type: 'rect', x: this.cm(1.6), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#2e4736'},
            {type: 'rect', x: this.cm(3.2), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#662c40'},
            {type: 'rect', x: this.cm(4.8), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#343a49'},
            {type: 'rect', x: this.cm(6.4), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#528c8e'},
            {type: 'rect', x: this.cm(8.0), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#362946'},
            {type: 'rect', x: this.cm(9.6), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#6b8133'},
            {type: 'rect', x: this.cm(11.2), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#2a3b56'},
            {type: 'rect', x: this.cm(12.8), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#862d2e'},
            {type: 'rect', x: this.cm(14.4), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#607f6e'},
            {type: 'rect', x: this.cm(16.0), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#273d3f'},
            {type: 'rect', x: this.cm(17.6), y: this.cm(0), w: this.cm(1.6), h: this.cm(0.55), color: '#a5916d'}
          ]
        });
      }
    } else {
      if (isInput) {
        stack.push({
          relativePosition: {x: this.cm(0), y: this.cm(0)},
          'canvas': [
            {type: 'rect', x: this.cm(0.0), y: this.cm(0), w: this.cm(2.2), h: this.cm(0.55), color: '#d69a2e'},
            {type: 'rect', x: this.cm(2.2), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#2e4736'},
            {type: 'rect', x: this.cm(4.5), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#662c40'},
            {type: 'rect', x: this.cm(6.8), y: this.cm(0), w: this.cm(2.25), h: this.cm(0.55), color: '#343a49'},
            {type: 'rect', x: this.cm(9.05), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#528c8e'},
            {type: 'rect', x: this.cm(11.35), y: this.cm(0), w: this.cm(2.25), h: this.cm(0.55), color: '#362946'},
            {type: 'rect', x: this.cm(13.6), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#6b8133'},
            {type: 'rect', x: this.cm(15.9), y: this.cm(0), w: this.cm(2.25), h: this.cm(0.55), color: '#2a3b56'},
            {type: 'rect', x: this.cm(18.15), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#862d2e'},
            {type: 'rect', x: this.cm(20.45), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#607f6e'},
            {type: 'rect', x: this.cm(22.75), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#273d3f'},
            {type: 'rect', x: this.cm(25.05), y: this.cm(0), w: this.cm(2.3), h: this.cm(0.55), color: '#a5916d'},
          ],
        });
      }
    }
    stack.push({
      relativePosition: {x: this.cm(this.xframe), y: this.cm(1.0)},
      columns: [
        {width: 'auto', text: `${this.title}`, fontSize: this.fs(36), color: this.colText, bold: true},
        {
          width: 'auto',
          text: this.subtitle,
          fontSize: this.fs(12),
          color: this.colSubTitle,
          bold: true,
          margin: [this.cm(0.5), this.cm(0.78), 0, 0]
        }
      ]
    });
    const y = this.titleInfoSub === '' ? 2.4 : 2.0;

    if (!Utils.isEmpty(this.titleInfo)) {
      stack.push({
        relativePosition: {x: this.cm(this.xframe), y: this.cm(y)},
        columns: [
          {
            width: this.cm(this.width - 4.4),
            text: this.titleInfo,
            fontSize: this.fs(10),
            color: this.colInfo,
            bold: true,
            alignment: 'right'
          }
        ]
      });
    }
    if (!Utils.isEmpty(this.titleInfoSub)) {
      stack.push({
        relativePosition: {x: this.cm(this.xframe), y: this.cm(2.4)},
        columns: [
          {
            width: this.cm(this.width - 4.4),
            text: this.titleInfoSub,
            fontSize: this.fs(8),
            color: this.colInfo,
            bold: true,
            alignment: 'right'
          }
        ]
      });
    }
    stack.push({
      relativePosition: {x: this.cm(this.xframe), y: this.cm(2.95)},
      canvas: [
        {
          type: 'line',
          x1: this.cm(0),
          y1: this.cm(0),
          x2: this.cm(this.width - 4.4),
          y2: this.cm(0),
          lineWidth: this.cm(0.2),
          lineColor: this.colText
        }
      ]
    });
    // footer
    if (params.skipFooter) {
      return ret;
    }
    stack.push([
      {
        relativePosition: {x: this.cm(this.xframe), y: this.cm(this.height - 2.0)},
        canvas: [
          {
            type: 'line',
            x1: this.cm(0),
            y1: this.cm(0),
            x2: this.cm(this.width - 4.4),
            y2: this.cm(0),
            lineWidth: this.cm(0.05),
            lineColor: this.colText
          }
        ]
      },
      this.footerTextAboveLine.text === ''
        ? null
        : {
          relativePosition: {
            x: this.cm(this.xframe + this.footerTextAboveLine.x),
            y: this.cm(this.height - 2.0 - this.footerTextAboveLine.y)
          },
          columns: [
            {
              width: this.cm(this.width - 2 * this.xframe),
              text: this.footerTextAboveLine.text,
              fontSize: this.fs(this.footerTextAboveLine.fs)
            }
          ]
        },
      this.footerText == null
        ? null
        : {
          relativePosition: {x: this.cm(this.xframe), y: this.cm(this.height - 1.7)},
          stack: this.footerText,
          fontSize: this.fs(10)
        },
      isInput ? this._getFooterImage('input', {x: this.width - 5.6, y: this.height - 3.3, width: 4.0}) : {},
      {
        relativePosition: {x: this.cm(this.xframe), y: this.cm(this.height - 1.7)},
        columns: [
          {
            width: this.cm(this.width - 2 * this.xframe),
            stack: [],
            alignment: 'right'
          }
        ]
      }
    ]);
    return ret;
  }

  addTableRow(check: boolean, width: any, dst: any, head: any, content: any): void {
    if (!check) {
      return;
    }
    if (!this.tableHeadFilled) {
      this.tableHeadLine.push(head);
      this.tableWidths.push(width);
    }
    dst.push(content);
  }

  getTable(widths: any, body: any): any {
    return {
      columns: [
        {
          margin: [this.cm(2.2), this.cmy(this.yorg), this.cm(2.2), this.cmy(0.0)],
          width: this.cm(this.width),
          fontSize: this.fs(10),
          table: {widths: widths, body: body},
        }
      ],
      pageBreak: ''
    };
  }

  init(suffix: string): void {
    this.suffix = suffix ?? '-';
    this.isPortraitParam = this.isPortrait;
  }

  extractParams(): void {
  };

  _getFooterImage(id: string, params: { x: number, y: number, width: number, height?: number }) {
    if (params.height == null) {
      params.height = 0.0;
    }
    let ret: any = {
      relativePosition: {x: this.cm(params.x), y: this.cm(params.y)},
      image: id
    };

    if (this.images[id] != null) {
      if (params.width != 0 && params.height != 0) {
        ret.fit = [this.cm(params.width), this.cm(params.height)];
      } else if (params.width != 0) {
        ret.width = this.cm(params.width);
      } else if (params.height != 0) {
        ret.height = this.cm(params.height);
      }
    } else {
      ret = {
        stack: [
          {
            relativePosition: {x: this.cm(params.x), y: this.cm(params.y)},
            canvas: [
              {
                type: 'rect',
                x: this.cm(0),
                y: this.cm(0),
                w: this.cm(Math.max(params.width, 0.01)),
                h: this.cm(Math.max(params.height, 0.01)),
                lineWidth: this.cm(0.01),
                lineColor: '#f00'
              }
            ]
          },
          {
            relativePosition: {x: this.cm(params.x), y: this.cm(params.y)},
            text: `bild\n${id}\nfehlt`,
            color: '#f00'
          }
        ]
      };
    }
    return ret;
  }

  getEmptyForm(isPortrait: boolean, status: string, params?: { skipFooter?: boolean }): PageData {
    return new PageData(isPortrait, [
      this.headerFooter({skipFooter: params?.skipFooter ?? false}),
      {
        margin: [this.cm(2), this.cm(3.5), this.cm(2), this.cm(0)],
        text: status === '401' ? this.msgServerNotReachable : this.msgMissingData,
        color: 'red',
        fontSize: this.fs(10),
        alignment: 'justify'
      },
    ], []);
  }

  countObjects(src: any): number {
    let ret = 1;
    if (Array.isArray(src)) {
      for (const entry of src) {
        ret += this.countObjects(entry);
      }
    }
    if (Object.keys(src).length > 0) {
      for (const key of Object.keys(src)) {
        ret += this.countObjects(src[key]);
      }
    }
    return ret;
  }

  _addPageBreak(page: PageData): void {
    if (page.content[page.content.length - 1].pageBreak === '-') {
      return;
    }
    page.content[page.content.length - 1].pageBreak = 'after';
    // int cnt = countObjects(page);
    // print(page.content);
    const text = JSON.stringify(page.content);
    this._fileSize += text.length;
  }

  abstract fillPages(pages: PageData[]): void;

  styleForTime(time: Date): string {
    if (time.getHours() < 6 || time.getHours() > 20) {
      return 'timeNight';
    }
    if (time.getHours() < 8 || time.getHours() > 17) {
      return 'timeLate';
    }
    return 'timeDay';
  }

  calcX(width: number, time: Date): number {
    return width / 1440 * (time.getHours() * 60 + time.getMinutes());
  }

  calcY(height: number, max: number, value: number): number {
    return height / max * (max - value);
  }

  S(min: number, step: number): StepData {
    return new StepData(min, step);
  }

  addLegendEntry(legend: LegendData, color: string, text: string, params?: {
    isArea?: boolean,
    image?: string,
    imgWidth?: number,
    imgOffsetY?: number,
    lineWidth?: number,
    graphText?: string,
    newColumn?: boolean,
    points?: { x: number, y: number }[],
    colGraphText?: string,
    colLegendText?: string
  }) {
    params ??= {};
    params.isArea ??= true;
    params.imgWidth ??= 0.6;
    params.imgOffsetY ??= 0.0;
    params.lineWidth ??= 0.0;
    params.newColumn ??= false;
    params.colGraphText ??= 'black';
    params.colLegendText ??= 'black';
    const dst = legend.current(params.newColumn);
    if (params.lineWidth === 0.0) {
      params.lineWidth = this.lw;
    }
    if (params.points != null) {
      for (const pt of params.points) {
        pt.x = this.cm(pt.x * 0.8);
        pt.y = this.cm(pt.y * 0.8);
      }
      dst.push({
        columns: [
          {
            width: this.cm(0.8),
            canvas: [
              {
                type: 'polyline',
                closePath: true,
                color: color,
                lineWidth: this.cm(0),
                points: params.points,
              }
            ],
          },
          {text: text, color: params.colLegendText, fontSize: this.fs(10)}
        ]
      });
    } else if (params.image != null) {
      dst.push({
        columns: [
          {
            width: this.cm(0.8),
            stack: [
              {
                margin: [this.cm(0.4 - params.imgWidth / 2), this.cm(params.imgOffsetY), this.cm(0), this.cm(0)],
                image: params.image,
                width: this.cm(params.imgWidth)
              }
            ],
          },
          {text: text, color: params.colLegendText, fontSize: this.fs(10)}
        ]
      });
    } else if (params.isArea && params.graphText != null) {
      dst.push({
        columns: [
          {
            width: this.cm(0.8),
            layout: 'noBorders',
            margin: [this.cm(0.0), this.cm(0), this.cm(0), this.cm(0.1)],
            table: {
              widths: [this.cm(0.6)],
              body: [
                [
                  {
                    text: params.graphText,
                    color: params.colGraphText,
                    fontSize: this.fs(6),
                    alignment: 'center',
                    fillColor: color
                  }
                ]
              ]
            }
          },
          {text: text, color: params.colLegendText, fontSize: this.fs(10)}
        ]
      });
    } else if (params.isArea) {
      dst.push({
        columns: [
          {
            width: this.cm(0.8),
            canvas: [
              {
                type: 'rect',
                x: this.cm(0),
                y: this.cm(0.1),
                w: this.cm(0.5),
                h: this.cm(0.3),
                color: color,
                fillOpacity: 0.3
              },
              {type: 'rect', x: 0, y: 0, w: 0, h: 0, color: params.colGraphText, fillOpacity: 1},
              {
                type: 'line',
                x1: this.cm(0),
                y1: this.cm(0.1),
                x2: this.cm(0.5),
                y2: this.cm(0.1),
                lineWidth: this.cm(params.lineWidth),
                lineColor: color
              },
              {
                type: 'line',
                x1: this.cm(0),
                y1: this.cm(0.4),
                x2: this.cm(0.5),
                y2: this.cm(0.4),
                lineWidth: this.cm(params.lineWidth),
                lineColor: color
              }
            ]
          },
          {text: text, color: params.colLegendText, fontSize: this.fs(10)}
        ]
      });
    } else {
      dst.push({
        columns: [
          {
            width: this.cm(0.8),
            canvas: [
              {
                type: 'line',
                x1: this.cm(0),
                y1: this.cm(0.25),
                x2: this.cm(0.5),
                y2: this.cm(0.25),
                lineWidth: this.cm(params.lineWidth),
                lineColor: color
              }
            ]
          },
          {text: text, color: params.colLegendText, fontSize: this.fs(10)}
        ]
      });
    }
  }

  getFormPages(repData: ReportData, currentSize: number): Observable<PageData[]> {
    this.repData = repData;
    return this.ps.collectBase64Images(this.imgList).pipe(map(list => {
      for (const entry of list) {
        this.images[entry.id] = entry.url;
      }
      let ret: PageData[] = [];
      this.extractParams();
      for (const param of this.params) {
        param.isForThumbs = false;
      }
      this._pages = [];
      this._fileSize = currentSize;
      try {
        this.scale = 1.0;
        let colCount = 1;
        let rowCount = 1;
        switch (this.pagesPerSheet) {
          case 2:
            this.scale = 21 / 29.7;
            colCount = 1;
            rowCount = 2;
            break;
          case 4:
            this.scale = 0.5;
            colCount = 2;
            rowCount = 2;
            break;
          case 8:
            this.scale = 21 / 29.7 / 2;
            colCount = 2;
            rowCount = 4;
            break;
          case 16:
            this.scale = 0.25;
            colCount = 4;
            rowCount = 4;
            break;
          case 32:
            this.scale = 21 / 29.7 / 4;
            colCount = 4;
            rowCount = 8;
            break;
        }
        this.offsetX = 0.0;
        this.offsetY = 0.0;
        this.fillPages(this._pages);
        let column = 0;
        let row = 0;
        for (let i = 0; i < this._pages.length; i++) {
          const page = this._pages[i];
          switch (this.pagesPerSheet) {
            case 2:
            case 8:
            case 32:
              page.isPortrait = !page.isPortrait;
              break;
          }
          this.offsetX = column * this.width;
          this.offsetY = row * this.height;
          page.offset(this.cmx(0), this.cmy(0));
          if (column === 0 && row === 0) {
            ret.push(page);
          } else {
            ret[ret.length - 1].content.push(page.asElement);
          }
          column++;

          if (column >= colCount) {
            column = 0;
            row++;
            if (row >= rowCount && i < this._pages.length - 1) {
              row = 0;
              this._addPageBreak(page);
            }
          }
          //        ret.pushAll(page);
          //        if(page != _pages.last)
          //          addPageBreak(ret.last);
        }
      } catch (ex) {
        this.offsetX = 0.0;
        this.offsetY = 0.0;
        // ret = {
        //   'pageSize': 'a4',
        //   'pageOrientation': 'portrait',
        //   'pageMargins': [cmx(1), cmy(1), cmx(1), cmy(1)],
        //   'content': [
        //     {'text': 'Fehler bei Erstellung von \'${title}\'', 'fontSize': fs(20), 'alignment': 'center', 'color': 'red'},
        //     {'text': '\n$ex', 'fontSize': fs(10), 'alignment': 'left'},
        //     {'text': '\n$s', 'fontSize': fs(10), 'alignment': 'left'}
        //   ]
        // };
        ret = [
          new PageData(this.isPortrait, [
            {
              margin: [this.cmx(1.0), this.cmy(0.5), this.cmx(1.0), this.cmy(0)],
              text: `Fehler bei Erstellung von "${this.title}"`,
              fontSize: this.fs(20),
              alignment: 'center',
              color: 'red'
            },
            {
              margin: [this.cmx(1.0), this.cmy(0.0), this.cmx(1.0), this.cmy(0)],
              text: `\n${ex}`,
              fontSize: this.fs(10),
              alignment: 'left'
            },
            {
              margin: [this.cmx(1.0), this.cmy(0.5), this.cmx(1.0), this.cmy(0)],
              text: `\n${(ex as any)?.stack}`,
              fontSize: this.fs(10),
              alignment: 'left'
            }
          ], [])
        ];
      }

      return ret;
    }));
  }

  drawScaleIE(xo: number, yo: number, graphHeight: number, top: number, min: number, max: number, colWidth: number,
              horzCvs: any[], vertStack: any[], steps: StepData[], display: (i: number, step: number, value?: number) => string) {
    let step = 0.1;
    for (const entry of steps) {
      if (max - min > entry.min) {
        step = entry.step;
        break;
      }
    }
    const gridLines = Math.floor(((max - min) / step) + 1);
    const lineHeight = gridLines === 0 ? 0 : graphHeight / gridLines;

//    top += 0.1 * (lineHeight / step);
    for (let i = 1; i < gridLines; i++) {
      const y = top + (gridLines - i) * lineHeight;
      horzCvs.push({
        type: 'line',
        x1: this.cm(-0.2),
        y1: this.cm(y) - this.lw / 2,
        x2: this.cm(24 * colWidth + 0.2),
        y2: this.cm(y) - this.lw / 2,
        lineWidth: this.cm(this.lw),
        lineColor: i > 0 ? this.lc : this.lcFrame
      });
//      double value = min + (max - min) / step * i;
//      vertCvs.push({'relativePosition': {'x': this.cm(xo - 0.7), 'y': this.cm(yo + (gridLines - i) * lineHeight - 0.15)},
//      'text': GLOBALS.fmtNumber(i / 10, 1), 'fontSize': fs(8)});
      const text = display(i, step);
//      String text = '${GLOBALS.fmtNumber(i * step, 1)} ${msgInsulinUnit}';
      vertStack.push({
        relativePosition: {x: this.cm(xo - 3.0), y: this.cm(y + yo - 0.15)},
        columns: [
          {width: this.cm(2.7), text: text, fontSize: this.fs(8), alignment: 'right'}
        ]
      });
      vertStack.push({
        relativePosition: {x: this.cm(xo + colWidth * 24 + 0.3), y: this.cm(y + yo - 0.15)},
        text: text,
        fontSize: this.fs(8)
      });
    }
    return (gridLines - 1) * lineHeight;
  }

  getTimeConsumingParts(data: ReportData, ret: string[]): void {
  }
}
