import {BasePrint} from '@/forms/base-print';
import {PageData} from '@/_model/page-data';
import {ParamInfo} from '@/_model/param-info';
import {PdfService} from '@/_services/pdf.service';
import {Utils} from '@/classes/utils';

export class PrintCustomForm extends BasePrint {
  override help = $localize`:help for custom form@@help-custom-form:Ein Formular
  für die Ausgabe eines PDF aufgrund einer Datenstruktur.`;
  override baseId = 'customForm';
  override baseIdx = '1';
  isFormParam1: boolean;
  override params = [
    new ParamInfo(0, $localize`Name`, {stringValue: 'CustomForm'}),
    new ParamInfo(1, $localize`Width in cm`, {intValue: 6}),
    new ParamInfo(2, $localize`Height in cm`, {intValue: 4}),
    new ParamInfo(3, $localize`Info`, {stringValue: ''}),
  ];

  data = {
    name: '',
    width: 0,
    height: 0,
    info: ''
  }

  frame = 1;

  constructor(ps: PdfService, suffix: string = null) {
    super(ps);
    this.init(suffix);
  }

  static get msgParam1(): string {
    return $localize`Parameter für PrintTemplate`;
  }

  override get title(): string {
    return $localize`Nur ein Test`;
  }

  override get isDebugOnly(): boolean {
    return true;
  }

  override get estimatePageCount(): any {
    return {count: 1, isEstimated: true};
  }

  override get imgList(): string[] {
    return ['dropbox'];
  }

  override extractParams(): void {
    this.data.name = this.params[0].stringValue;
    this.data.width = this.params[1].intValue;
    this.data.height = this.params[2].intValue;
    this.data.info = this.params[3].stringValue;
  }

  override fillPages(pages: PageData[]): void {
    const oldLength = pages.length;
    const page = new PageData(this.isPortrait, [], []);
    const cvs: any[] = [];
    const dx = 0.2;
    const dy = 0.2;
    let xorg = dx;
    let yorg = dy;
    const width = this.width - 2 * this.frame - 2 * dx;
    const height = this.height - 2 * this.frame - 2 * dy;
    const wid = this.data.width; // (this.width - 2 * this.xorg) / 3;
    const hig = this.data.height; // (this.height - 2 * this.yorg) / 8;
    xorg = this.frame + (width - Math.floor(width / wid) * wid) / 2 + dx;
    yorg = this.frame + (height - Math.floor(height / hig) * hig) / 2 + dy;
    const pictures: any = {
      absolutePosition: {x: this.cm(0), y: this.cm(0)},
      stack: []
    };
    for (let x = xorg; x < this.width; x += wid) {
      Utils.pushAll(cvs, this.cropMark(x, null));
      for (let y = yorg; y < this.height; y += hig) {
        if (x === xorg) {
          Utils.pushAll(cvs, this.cropMark(null, y));
        }
        // Utils.pushAll(cvs, this.cutMark(x, y));
        // Utils.pushAll(cvs, this.cutMark(x, y));
        if (x > xorg && y > yorg) {
          page.content.push({
            absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - hig + dy)},
            columns: [
              {width: this.cm(wid - 2 * dx), text: this.data.name, alignment: 'right'}
            ]
          });
          page.content.push({
            absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - dy - 1)},
            columns: [
              {width: this.cm(wid - 2 * dx), text: this.data.info, alignment: 'right', color: '#666'}
            ]
          });
          pictures.stack.push({
            absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - hig + dy)},
            image: 'dropbox',
            width: this.cm(3.2)
          });
        }
      }
    }
    page.background.push(pictures);
    page.content.push({canvas: cvs});
    pages.push(page);
  }

  cropMark(x: number, y: number): any[] {
    const ret: any[] = [];
    const lw = 0.02;
    const color = 'black';
    if (x != null) {
      for (const y1 of [0, this.height - this.frame - 0.01]) {
        ret.push({
          type: 'line',
          x1: this.cm(x),
          y1: this.cm(y1),
          x2: this.cm(x),
          y2: this.cm(y1 + this.frame),
          lineWidth: this.cm(lw),
          lineColor: color
        });
      }
    }
    if (y != null) {
      for (const x1 of [0, this.width - this.frame - 0.01]) {
        ret.push({
          type: 'line',
          x1: this.cm(x1),
          y1: this.cm(y),
          x2: this.cm(x1 + this.frame),
          y2: this.cm(y),
          lineWidth: this.cm(lw),
          lineColor: color
        });
      }
    }
    return ret;
  }

  cutMark(x: number, y: number): any {
    const l = 0.2;
    const lw = this.lw;
    const color = '#888';
    return [{
      type: 'line',
      x1: this.cm(x - l),
      y1: this.cm(y),
      x2: this.cm(x + l),
      y2: this.cm(y),
      lineWidth: lw,
      lineColor: color
    }, {
      type: 'line',
      x1: this.cm(x),
      y1: this.cm(y - l),
      x2: this.cm(x),
      y2: this.cm(y + l),
      lineWidth: lw,
      lineColor: color
    }];
  }
}
