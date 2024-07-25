import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';

export abstract class BaseData {
  id: number;

  abstract get _asJson(): any;

  get asJson(): any {
    return {0: this.id, ...this._asJson};
  }

  get forBackend(): string {
    return this.asString;
    // return Utils.encodeBase64(this.asString);
  }

  get asString(): string {
    try {
      const value = this.asJson;
      return JSON.stringify(value);
    } catch (ex) {
      Utils.showDebug(ex);
      Log.error(`Fehler bei BaseData.asString`);
    }
    return null;
  }

  static toString(json: any, key: string, def = ''): string {
    if (json == null || json[key] == null) {
      return def;
    }
    return `${json[key]}`;
  }

  mapJsonArray(src: BaseData[]): any[] {
    return src?.map((entry, index) => {
      entry.id = index + 1;
      return entry.asJson;
    });
  }

  fillFromBackend(src: string): void {
    this.fillFromString(src);
//    this.fillFromString(id, Utils.decodeBase64(src));
  }

  abstract _fillFromJson(json: any, def?: any): void;

  __fillFromJson(json: any, def?: any): void {
    this.id = json?.['0'] ?? def?.id ?? 1;
    this._fillFromJson(json, def);
  }

  fillFromJson(json: any, def?: any): void {
    try {
      if (json == null) {
        json = {};
      }
      this.__fillFromJson(json, def);
    } catch (ex) {
      Utils.showDebug(ex);
      console.error('Fehler bei fillFromJson von', this, json);
    }
  };

  fillFromString(src: string): void {
    try {
      if (src == null || src.trim() === '') {
        this.fillFromJson({});
      } else {
        this.fillFromJson(JSON.parse(src));
      }
    } catch (ex) {
      Log.debug(ex);
      console.error('Fehler beim Parsing von', this, src);
    }
  }
}
