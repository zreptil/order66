import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {ColorData} from '@/_model/color-data';
import {ColorUtils} from '@/controls/color-picker/color-utils';

@Component({
  selector: 'app-color-picker-mixer',
  templateUrl: './color-picker-mixer.component.html',
  styleUrls: ['./color-picker-mixer.component.scss'],
  standalone: false
})
export class ColorPickerMixerComponent extends ColorPickerBaseComponent implements AfterViewInit {
  @ViewChild('canvasBox')
  canvasBox: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvasImage')
  canvasImage: ElementRef<HTMLCanvasElement>;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  width: number;
  height: number;
  colorList = [
    {color: new ColorData([0, 0, 0])},
    {color: new ColorData([255, 255, 255])},
    {color: new ColorData([255, 0, 0])},
    {color: new ColorData([255, 255, 0])},
    {color: new ColorData([0, 255, 0])},
    {color: new ColorData([0, 255, 255])},
    {color: new ColorData([0, 0, 255])},
    {color: new ColorData([255, 0, 255])}
  ];
  paintSize = 1;
  colorWheelXY: any = {display: 'none'};
  colorWheelPos = 'tl';
  colorWheelAnim: string;

  constructor() {
    super();
  }

  get styleForColorWheel(): any {
    const ret = this.colorWheelXY;
    if (this.colorWheelAnim != null) {
      (ret as any)['animation-name'] = this.colorWheelAnim;
    }
    return ret;
  }

  get wheelColorList(): ColorData[] {
    return this.colorList.map(c => c.color);
  }

  override ngAfterViewInit() {
    super.ngAfterViewInit();
    const box = this.canvasBox.nativeElement;
    this.canvas = this.canvasImage.nativeElement;
    this.canvas.width = box.clientWidth;
    this.canvas.height = box.clientHeight;
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    this.ctx = this.canvas.getContext('2d');
    this.paintCanvas();
  }

  wheelCanvas(event: WheelEvent) {
    this.paintSize += Math.sign(event.deltaY) * 5;
    this.paintSize = Math.max(Math.min(this.paintSize, 100), 1);
    this.paintCanvas();
  }

  paintCanvas(): void {
    const w = this.width / this.paintSize;
    const h = this.height / this.paintSize;
    const len = this.paintSize;
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    for (let yi = 0; yi < h; yi++) {
      const y = yi * this.paintSize;
      for (let xi = 0; xi < w; xi++) {
        const x = xi * this.paintSize;
        this.ctx.fillStyle = ColorUtils.display_rgb(this.getColorAtPos(x, y).value);
        this.ctx.fillRect(x, y, len, len);
      }

    }
  }

  getColorAtPos(x: number, y: number): ColorData {
    const cx1 = this.calcColor(this.data.mixColors.tl, this.data.mixColors.tr, x / this.width);
    const cx2 = this.calcColor(this.data.mixColors.bl, this.data.mixColors.br, x / this.width);
    return this.calcColor(cx1, cx2, y / this.height, false);
  }

  mousePos(event: MouseEvent): any {
    const ret = {
      x: event.offsetX,
      y: event.offsetY
    };
    ret.x = Math.floor(ret.x / this.paintSize) * this.paintSize;
    ret.y = Math.floor(ret.y / this.paintSize) * this.paintSize;

    return ret;
  }

  mouseMoveCanvas(event: MouseEvent) {
    const m = this.mousePos(event);
    this.colorChange?.next(this.getColorAtPos(m.x, m.y));
  }

  clickCanvas(event: MouseEvent) {
    const m = this.mousePos(event);
    const color = this.getColorAtPos(m.x, m.y);
    // console.log(this.data.mixColors.tl, this.data.mixColors.tr, this.data.mixColors.bl, this.data.mixColors.br);
    // console.log(color, m.x, m.y, this.width, this.height);
    if (this.colorList.length < 9) {
      this.colorList.splice(0, 0, {color: color});
    } else {
      this.colorList[0].color = color;
    }
    this.colorWheelXY = {display: 'none'};
  }

  mixValue(v1: number, v2: number): number {
    return Math.max(v1, v2);
  }

  mixColor(c1: ColorData, c2: ColorData): ColorData {
    const ret = new ColorData(null);
    for (let i = 0; i < 3; i++) {
      ret.value[i] = this.mixValue(c1.value[i], c2.value[i]);
    }
    return ret;
  }

  calcColor(c1: ColorData, c2: ColorData, f: number, checkEqual = true): ColorData {
    if (checkEqual) {
      const chk = this.mixColor(c1, c2);
      // if c1 is fully contained in the mix of the two colors
      // then c1 is faded and c2 is fully mixed in
      if (chk.similar(c1)) {
        c1 = this.fadeColor(c1, 1 - f);
        return this.mixColor(c1, c2);
      }
      // if c2 is fully contained in the mix of the two colors
      // then c2 is faded and c1 is fully mixed in
      if (chk.similar(c2)) {
        c2 = this.fadeColor(c2, f);
        return this.mixColor(c1, c2);
      }
    }

    // up to 0.5 the first color is taken as it is
    if (f > 0.5) {
      // from 0.5 the first color will be faded
      // from 100% to 0 when reaching 1.0
      c1 = this.fadeColor(c1, (1 - f) * 2);
    }
    // from 0.5 the second color is taken as it is
    if (f < 0.5) {
      // up to 0.5 the second color will be faded
      // from 100% to 0 when reaching 1.0
      c2 = this.fadeColor(c2, f * 2);
    }
    return this.mixColor(c1, c2);
  }

  fadeColor(c: ColorData, f: number): ColorData {
    return new ColorData([Math.floor(f * c.value[0]),
      Math.floor(f * c.value[1]),
      Math.floor(f * c.value[2])]);
  }

  selectColor(color: ColorData) {
    return {backgroundColor: ColorUtils.display_rgb(color.value)};
  }

  selectColorWheel(idx: number) {
    const ret = this.selectColor(this.wheelColorList[idx]);
    (ret as any)['transform'] = `rotate(${360 / this.wheelColorList.length * idx}deg)`;
    return ret;
  }

  clickColorSelect(color: ColorData) {
    (this.data.mixColors as any)[`${this.colorWheelPos}`] = color;
    this.data.onDataChanged?.emit(this.data);
    this.colorWheelAnim = 'close';
    this.paintCanvas();
  }

  clickSelectTrigger(pos: string) {
    this.colorWheelPos = pos;
    switch (pos) {
      case 'tl':
        this.colorWheelXY = {top: 0, left: 0};
        break;
      case 'tr':
        this.colorWheelXY = {top: 0, right: 0};
        break;
      case 'br':
        this.colorWheelXY = {bottom: 0, right: 0};
        break;
      case 'bl':
        this.colorWheelXY = {bottom: 0, left: 0};
        break;
    }
    this.colorWheelAnim = 'open';
  }
}
