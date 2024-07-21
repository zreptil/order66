import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';

export abstract class BaseData {
  id: number;

  abstract get asJson(): any;

  get _asJson(): any {
    return {0: this.id, ...this._asJson};
  }

  get forBackend(): string {
    return Utils.encodeBase64(this.asString);
  }

  get asString(): string {
    try {
      const value = this.asJson;
      delete (value?.['0']);
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

  fillFromBackend(id: number, src: string): void {
    this.fillFromString(id, Utils.decodeBase64(src));
  }

  abstract _fillFromJson(json: any, def?: any): void;

  __fillFromJson(id: number, json: any, def?: any): void {
    this.id = json?.['0'] ?? def?.id ?? 0;
    this._fillFromJson(json, def);
  }

  fillFromJson(id: number, json: any, def?: any): void {
    try {
      if (json == null) {
        json = {};
      }
      this.__fillFromJson(id, json, def);
    } catch (ex) {
      Utils.showDebug(ex);
      console.error('Fehler bei fillFromJson von', this, json);
    }
  };

  fillFromString(id: number, src: string): void {
    try {
      if (src == null || src.trim() === '') {
        this.fillFromJson(0, {});
      } else {
        this.fillFromJson(id, JSON.parse(src));
      }
    } catch (ex) {
      Log.debug(ex);
      console.error('Fehler beim Parsing von', this, src);
    }
  }
}
