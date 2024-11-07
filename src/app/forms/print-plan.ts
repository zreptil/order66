import {BasePrint} from '@/forms/base-print';
import {PageData} from '@/_model/page-data';
import {PdfService} from '@/_services/pdf.service';
import {PlanData} from '@/_model/plan-data';
import {Utils} from '@/classes/utils';
import {UserType} from '@/_model/app-data';

export class PrintPlanForm extends BasePrint {
  override help = $localize`:help for plan form@@help-plan-form:A form for
  a careplan.`;
  override baseId = 'planForm';
  override baseIdx = '2';
  isFormParam1: boolean;
  override params: any[] = [
    // new ParamInfo(0, $localize`Name`, {stringValue: 'Careplan'}),
    // new ParamInfo(1, $localize`Width in cm`, {intValue: 6}),
    // new ParamInfo(2, $localize`Height in cm`, {intValue: 4}),
    // new ParamInfo(3, $localize`Info`, {stringValue: ''}),
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
    return [
      'print-checkbox', 'print-close', 'print-done',
      'print-nightlight', 'print-light_mode', 'print-today'
    ];
  }

  override extractParams(): void {
    // this.data.name = this.params[0].stringValue;
    // this.data.width = this.params[1].intValue;
    // this.data.height = this.params[2].intValue;
    // this.data.info = this.params[3].stringValue;
  }

  override fillPages(pages: PageData[]): void {
    const oldLength = pages.length;
    const page = new PageData(this.isPortrait, [], []);
    const cvs: any[] = [];
    const text: any[] = [];
    const pictures: any = {
      absolutePosition: {x: this.cm(0), y: this.cm(0)},
      stack: []
    };
    const plan = this.repData.data as PlanData;
    const xorg = 1.0;
    let yorg = 1.0;
    const wid = page.width - 2 * xorg;
    const gap = 0.2;
    page.content.push({
      absolutePosition: {x: this.cm(xorg), y: this.cm(yorg)},
      columns: [
        {
          width: this.cm(wid),
          text: $localize`Versorgungsplan`,
          alignment: 'center',
          fontSize: this.fs(30),
          bold: true
        },
      ],
    });
    page.content.push({
      absolutePosition: {x: this.cm(0), y: this.cm(0)},
      canvas: cvs
    });
    cvs.push({
      type: 'line',
      x1: this.cm(xorg),
      y1: this.cm(yorg),
      x2: this.cm(xorg + wid),
      y2: this.cm(yorg),
      lineWidth: this.cm(0.01)
    });
    cvs.push({
      type: 'line',
      x1: this.cm(xorg),
      y1: this.cm(yorg + 1.4),
      x2: this.cm(xorg + wid),
      y2: this.cm(yorg + 1.4),
      lineWidth: this.cm(0.01)
    });
    const stack: any[] = [];
    page.content.push({
      absolutePosition: {x: this.cm(xorg), y: this.cm(yorg + 2)},
      stack: stack
    });
    yorg += 2.0;
    let dayIdx = 0;
    for (const day of plan.days) {
      // Tagesüberschrift
      stack.push({
        columns: [
          {
            width: this.cm(wid),
            text: Utils.fmtDate(day.date, $localize`dd. MMMM yyyy (dddd)`),
            alignment: 'center',
            fontSize: this.fs(16),
          }
        ],
      });
      for (const timeRange of day.timeRanges) {
        if (timeRange.actions.length > 0) {
          const subStack: any[] = [];
          stack.push({
            margin: [0, this.cm(0.3), 0, this.cm(0.3)],
            columns: [{
              margin: [0, this.cm(0.05), 0, 0],
              width: this.cm(0.5),
              image: `print-${timeRange.typeIcon}`
            }, {
              width: this.cm(gap),
              text: ''
            },
              {
                width: this.cm(wid - gap - 0.5),
                text: timeRange.typeName,
                alignment: 'left',
                fontSize: this.fs(16),
              }
            ]
          }, {
            stack: subStack
          });
          for (const action of timeRange.actions) {
            subStack.push({
              margin: [0, 0, 0, this.cm(0.3)],
              columns: [{
                width: this.cm(0.5),
                image: `print-${day?.iconForDone(action) ?? 'close'}`
              }, {
                width: this.cm(gap),
                text: ''
              },
                {
                  width: this.cm(wid - gap - 0.5),
                  text: action.text,
                }
              ]
            });
          }
          const images: { [type: string]: any[] } = {};
          for (const picture of timeRange.pictures) {
            images[picture.userType] ??= [];
            images[picture.userType].push({
              stack: [{
                image: '@loading',
                width: this.cm(wid / 4 - gap)
              }, {
                text: picture.info ?? '',
                color: picture.userType === UserType.Owner ? null : 'blue',
                fontSize: this.fs(10)
              }
              ],
              width: this.cm(wid / 4 - gap)
            });
            this.ps.loadPending++;
            const idx = images[picture.userType].length - 1;
            this.ps.getBase64Image(picture.url).subscribe({
              next: data => {
                if (data !== 'loading') {
                  if (data != null) {
                    images[picture.userType][idx].stack[0].image = data;
                  } else {
                    delete images[picture.userType][idx].stack[0].image;
                    images[picture.userType][idx].stack[0].text = '';
                  }
                  this.ps.loadPending--;
                }
              }, error: err => {
                this.ps.loadPending--;
              }
            });
          }
          this.addImages(images[UserType.Owner], subStack, gap);
          if (timeRange.info != null) {
            subStack.push({
              margin: [0, 0, this.cm(xorg), this.cm(0.3)],
              text: timeRange.info,
              color: 'blue'
            });
          }
          this.addImages(images[UserType.Sitter], subStack, gap);
        }
      }
      dayIdx++;
      if (dayIdx < plan.days.length) {
        stack[stack.length - 1].pageBreak = 'after';
      }
    }
    // for (let x = xorg; x < this.width; x += wid) {
    //   Utils.pushAll(cvs, this.cropMark(x, null));
    //   for (let y = yorg; y < this.height; y += hig) {
    //     if (x === xorg) {
    //       Utils.pushAll(cvs, this.cropMark(null, y));
    //     }
    //     // Utils.pushAll(cvs, this.cutMark(x, y));
    //     // Utils.pushAll(cvs, this.cutMark(x, y));
    //     if (x > xorg && y > yorg) {
    //       page.content.push({
    //         absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - hig + dy)},
    //         columns: [
    //           {width: this.cm(wid - 2 * dx), text: this.data.name, alignment: 'right'}
    //         ]
    //       });
    //       page.content.push({
    //         absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - dy - 1)},
    //         columns: [
    //           {width: this.cm(wid - 2 * dx), text: this.data.info, alignment: 'right', color: '#666'}
    //         ]
    //       });
    //       pictures.stack.push({
    //         absolutePosition: {x: this.cm(x - wid + dx), y: this.cm(y - hig + dy)},
    //         image: 'dropbox',
    //         width: this.cm(3.2)
    //       });
    //     }
    //   }
    // }
    // page.content.push({
    //   absolutePosition: {x: this.cm(xorg), y: this.cm(yorg)},
    //   canvas: []
    // });
    page.background.push(pictures);
    pages.push(page);
  }

  addImages(images: any[], dst: any[], gap: number) {
    if (images != null) {
      let columns: any[] = [];
      for (const img of images) {
        columns.push(img);
        if (columns.length === 4) {
          dst.push({
            margin: [0, 0, 0, this.cm(gap)],
            columnGap: this.cm(gap),
            columns: columns
          });
          columns = [];
        }
      }
      if (columns.length > 0) {
        dst.push({
          margin: [0, 0, 0, this.cm(gap)],
          columnGap: this.cm(gap),
          columns: columns
        });
      }
    }
  }
}
