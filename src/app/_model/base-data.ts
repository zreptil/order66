import {Utils} from '@/classes/utils';
import {Log} from '@/_services/log.service';

export abstract class BaseData {
  abstract get asJson(): any;

  get forBackend(): string {
    return Utils.encodeBase64(this.asString);
  }

  get asString(): string {
    try {
      return JSON.stringify(this.asJson);
    } catch (ex) {
      Utils.showDebug(ex);
      Log.error(`Fehler bei BaseData.asJsonString`);
    }
    return null;
  }

  static toString(json: any, key: string, def = ''): string {
    if (json == null || json[key] == null) {
      return def;
    }
    return `${json[key]}`;
  }

  fillFromBackend(src: string): void {
    console.log(Utils.decodeBase64(src));
    this.fillFromString(Utils.decodeBase64(src));
  }

  abstract _fillFromJson(json: any, def?: any): void;

  fillFromJson(json: any, def?: any): void {
    try {
      if (json == null) {
        json = {};
      }
      this._fillFromJson(json, def);
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
