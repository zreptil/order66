import {Utils} from '@/classes/utils';

export class GridData {
  colWidth: number;
  lineHeight: number;
  glucScale: number;
  gridLines: number;
}

export class LegendData {
  columns: any[] = [];

  constructor(public x: number, public y: number, public colWidth: number, public maxLines: number) {
  }

  get asOutput(): any {
    return this.columns.length > 0 ? {stack: this.columns} : null;
  }

  current(forceNew: boolean): any[] {
    if (Utils.isEmpty(this.columns) || Utils.last(this.columns).stack.length >= this.maxLines || forceNew) {
      this.x += !Utils.isEmpty(this.columns) ? this.colWidth : 0.0;
      this.columns.push({
        relativePosition: {x: this.x, y: this.y},
        stack: []
      });
    }
    return Utils.last(this.columns).stack;
  }
}

export class PageData {
  x = 0;
  y = 0;

  constructor(public isPortrait: boolean, public content: any[], public background: any[]) {
  }

  get width(): number {
    return this.isPortrait ? 21.0 : 29.7;
  }

  get height(): number {
    return this.isPortrait ? 29.7 : 21.0;
  }

  get asElement(): any {
    return {
      absolutePosition: {x: this.x, y: this.y},
      stack: this.content
    }
  };

  get asBackElement(): any {
    return {
      absolutePosition: {x: this.x, y: this.y},
      stack: this.background
    }
  };

  offset(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

