import {Injectable} from '@angular/core';
import {MaterialColorService} from '@/_services/material-color.service';
import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';
import {MessageService} from '@/_services/message.service';
import {DialogResultButton} from '@/_model/dialog-data';
import JSZip from 'jszip';
import {encode} from 'base64-arraybuffer';
import {GLOBALS} from '@/_services/globals.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  static lsThemeName = 'owntheme';
  readonly currTheme: any = {};
  langHeight = '16em';

  constructor(public mas: MessageService,
              public mcs: MaterialColorService,
              public msg: MessageService) {
    window.addEventListener('resize', this.onResize);
    GLOBALS.requestJson(`assets/themes/standard/colors.json`).then(result => {
      this._stdTheme = result;
      this.restoreTheme();
    });
    this.onResize();
  }

  _stdTheme: any;

  get stdTheme(): any {
    return this._stdTheme ?? {};
  }

  get themeWidth(): string {
    let ret = 6 + 2.4 * Object.keys(GLOBALS.themeList).length;
    if (Log.mayDebug) {
      ret += 2;
    }
    if (GLOBALS.editColors) {
      ret += 2;
    }
    return `${ret}em`
  }

  get isWatch(): boolean {
    return window.location.href.indexOf('watch') > 0;
  }

  restoreTheme(): void {
    if (GLOBALS.themeKey !== 'own' && !GLOBALS.themeChanged) {
      return;
    }
    let src: any = {};
    if (GLOBALS.ownTheme != null) {
      try {
        if (typeof GLOBALS.ownTheme === 'string') {
          src = JSON.parse(Utils.decodeBase64(GLOBALS.ownTheme)) ?? {};
        } else {
          src = GLOBALS.ownTheme;
        }
      } catch {
        src = {};
      }
    }
    for (const key of Object.keys(this.stdTheme)) {
      this.currTheme[key] = src[key] ?? this.currTheme[key] ?? this.stdTheme[key];
    }
    this.assignStyle(document.body.style, this.currTheme);
    // const t = GLOBALS.ownTheme;
    // if (t != null) {
    // }
  }

  storeTheme(): void {
    const list = Object.keys(this.stdTheme);
    list.sort();
    let src: any = {};
    for (const key of list) {
//      if (this.currTheme[key] != null) {
      src[key] = this.currTheme[key] ?? this.stdTheme[key];
//      }
    }
    src = JSON.stringify(src);
    GLOBALS.ownTheme = Utils.encodeBase64(src);
    GLOBALS.saveWebData();
  }

  packTheme(onDone: (data: string) => void, onError?: (error: string) => void): void {
    if (onDone == null) {
      return;
    }
    const zip = new JSZip();
    zip.file('t', JSON.stringify(this.currTheme));
    zip.generateAsync({type: 'blob', compression: 'DEFLATE'})
      .then(blob => {
        blob.arrayBuffer()
          .then(buffer => {
            onDone(encode(buffer));
            GLOBALS.saveWebData();
          })
          .catch(error => {
            onError?.(error.message);
          });
      })
      .catch(error => {
        onError?.(error.message);
      });
  }

  unpackTheme(theme: string, onDone: (data: any) => void, onError?: (error: string) => void): void {
    if (onDone == null) {
      return;
    }
    const zip = new JSZip();
    zip.loadAsync(theme, {base64: true})
      .then(packed => {
        packed.file('t').async('string')
          .then(theme => {
            onDone(JSON.parse(theme));
          })
          .catch(error => {
            onError?.(error.message);
          });
      })
      .catch(error => {
        onError?.(error.message);
      });
  }

  onResize() {
    document.body.style.setProperty('--doc-height', `${window.innerHeight}px`);
  }

  async updateWithStandardTheme(theme: any) {
    const std: any = this.stdTheme;
    for (const key of Object.keys(std)) {
      if (theme[key] == null) {
        theme[key] = std[key];
      }
    }
  }

  async setTheme(name: string, setGlobalTheme = false, checkThemeChanged = true) {
    if (checkThemeChanged && GLOBALS.themeChanged) {
      this.msg.confirm($localize`Es wurden Farben geändert. Sollen diese Änderungen verworfen werden?`).subscribe(result => {
        if (result?.btn === DialogResultButton.yes) {
          GLOBALS.themeChanged = false;
          this.setTheme(name, setGlobalTheme);
        }
      });
      return;
    }
    if (GLOBALS.themeList[name] == null) {
      name = 'own';
    }
    if (setGlobalTheme) {
      GLOBALS.theme = name;
    }
    const suffix = this.isWatch ? '-watch' : '';
    let theme: any;
    if (name != null && name !== 'null') {
      document.getElementById('themestyle').setAttribute('href', `assets/themes/${name}/index.css`);
      document.getElementById('favicon').setAttribute('href', `assets/themes/${name}/favicon${suffix}.png`);
      if (name === 'own') {
        this.restoreTheme();
        await this.updateWithStandardTheme(this.currTheme);
        GLOBALS.saveWebData();
        return;
      } else {
        theme = await GLOBALS.requestJson(`assets/themes/${name}/colors.json`) ?? {};
        if (name !== 'standard') {
          await this.updateWithStandardTheme(theme);
        }
      }
    } else {
      name = GLOBALS.baseThemeName(name);
      if (name != null) {
        theme = await GLOBALS.requestJson(`assets/themes/${name}/colors.json`) ?? {};
      }
    }
    if (theme == null) {
      return;
    }
    // Log.todo('In ThemeService.setTheme könnten die Farben animiert werden, wenn ich rausfinde, wie das durch Veränderung der CSS-Variablen funktioniert.');
    // Versuch einer Farbanimation über Veränderung der Variablen - bisher leider erfolglos
    // if (this.currTheme != null) {
    //   const bodyTag = document.querySelector('body') as HTMLBodyElement;
    //   for (const key of Object.keys(theme)) {
    //     bodyTag.style.removeProperty(`--${key}`);
    //   }
    //   bodyTag.animate([
    //     this.getThemeStyle(this.currTheme),
    //     this.getThemeStyle(theme)
    //   ], {duration: 1000, direction: 'normal', fill: 'forwards'});
    //   console.log(this.getThemeStyle(this.currTheme));
    //   console.log(this.getThemeStyle(theme));
    //   // this.getThemeStyle(theme);
    // } else {
    this.assignStyle(document.body.style, theme);
//    }
//    GLOBALS.theme = theme;
    GLOBALS.saveWebData();
  }

  assignStyle(style: CSSStyleDeclaration, theme: any): void {
    if (style == null) {
      return;
    }
    for (const key of Object.keys(theme)) {
      let value = theme[key];
      if (this.mcs.colors[value] != null) {
        value = this.mcs.colors[value];
      }
      this.currTheme[key] = value;
      style.setProperty(`--${key}`, value);
    }
    style.setProperty('--lang-height', this.langHeight);
    style.setProperty('--theme-width', this.themeWidth);
  }

  getThemeStyle(theme: any): any {
    const ret: any = {};
    for (const key of Object.keys(theme)) {
      let value = theme[key];
      if (this.mcs.colors[value] != null) {
        value = this.mcs.colors[value];
      }
      ret[`--${key}`] = value;
    }
    return ret;
  }

  // sets one value in the theme, but only if this value exists
  setThemeValue(key: string, value: string): void {
    if (document.body.style.getPropertyValue(key) != null) {
      document.body.style.setProperty(key, value);
    }
  }

  // extracts the theme from the body tag
  extractTheme(): any {
    const ret: { [key: string]: string } = {};
    const list = document.body.style.cssText.split(';');
    for (const entry of list) {
      if (!Utils.isEmpty(entry)) {
        const parts = entry.split(':');
        ret[parts[0].trim()] = parts[1].trim();
      }
    }
    return ret;
  }
}
