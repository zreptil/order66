import {Log} from '@/_services/log.service';
import {DatepickerPeriod} from '@/controls/datepicker/datepicker-period';

export class Utils {
  static get now(): Date {
    return new Date();
  }

  static async hash(text: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array
      .from(new Uint8Array(hashBuffer))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  static replace(text: string, src: string | string[], dst: string | string[]): string {
    if (!Array.isArray(src) && !Array.isArray(dst)) {
      src = [src];
      dst = [dst];
    }
    if (src.length !== dst.length) {
      console.error('Utils.replace: src and dst must have the same length', text, src, dst);
      return text;
    }
    for (let i = 0; i < src.length; i++) {
      text = text.replace(src[i], dst[i]);
    }
    return text;
  }

  static last<T>(list: T[]): T {
    return list?.[list.length - 1] ?? null;
  }

  static first<T>(list: T[]): T {
    return list?.[0] ?? null;
  }

  static pushAll<T>(dst: T[], src: T[]): void {
    for (const entry of src ?? []) {
      dst.push(entry);
    }
  }

  static addTimeSeconds(date: Date, seconds: number): Date {
    const ret = new Date();
    ret.setTime(date.getTime() + seconds * 1000);
    return ret;
  }

  static addTimeMinutes(date: Date, minutes: number): Date {
    const ret = new Date();
    ret.setTime(date.getTime() + minutes * 1000 * 60);
    return ret;
  }

  static addTimeHours(date: Date, hours: number): Date {
    const ret = new Date();
    ret.setTime(date.getTime() + hours * 1000 * 60 * 60);
    return ret;
  }

  static addDateDays(date: Date, days: number): Date {
    const ret = new Date();
    ret.setTime(date.getTime());
    ret.setDate(ret.getDate() + days);
    return ret;
  }

  static getDow(date: Date): number {
    let ret = date.getDay() - 1;
    if (ret < 0) {
      ret += 7;
    }
    return ret;
  }

  static addDateMonths(date: Date, months: number): Date {
    const ret = new Date();
    ret.setTime(date.getTime());
    ret.setMonth(ret.getMonth() + months);
    return ret;
  }

  static show(msg: any): void {
    console.log(msg);
  }

  static showDebug(msg: any): void {
    console.error(msg);
  }

  static pad(text: string | number, length = 2, padchar = '0'): string {
    let ret = `${text}`;
    while (ret.length < length) {
      ret = `${padchar}${ret}`;
    }
    return ret;
  }

  static fmtDuration(minutes: number): string {
    const isPast = minutes < 0;
    const hours = Math.floor(Math.abs(minutes) / 60);
    if (hours != 0) {
      if (isPast) {
        return $localize`${hours}\:${Utils.pad(-minutes % 60)} hours ago`;
      } else {
        return $localize`in ${hours}\:${Utils.pad(minutes % 60)} hours`;
      }
    }
    return isPast ? $localize`${-minutes} min ago` : $localize`in ${minutes} min`;
  }

  static sortTime(list: any[], map: (m: any) => { time: number } = m => m): any[] {
    return list?.sort((a, b) => {
      if (map(a).time < map(b).time) {
        return -1;
      }
      if (map(a).time > map(b).time) {
        return 1;
      }
      return 0;
    })
  }

  static fmtTime(time: number): string {
    if (isNaN(time)) {
      time = 0;
    }
    const hour = Math.floor(time / 60);
    const minute = time % 60;
    return Utils.fmtDate(new Date(0, 0, 0, hour, minute), 'hh:mm');
  }

  static parseDate(value: string): Date {
    let ret = null;
    if (value?.length === 8) {
      const y = parseInt(value.substring(0, 4));
      const m = parseInt(value.substring(4, 6)) - 1;
      const d = parseInt(value.substring(6, 8));
      ret = new Date(y, m, d);
    }

    return ret;
  }

  static fmtDateTime(date: Date | number): string {
    if (typeof date === 'number') {
      date = new Date(date);
    }
    return Utils.fmtDate(date, $localize`dd/MM/yyyy, hh:mm`);
  }

  static fmtDate(date: Date, fmt: string = null): string {
    if (fmt == null) {
      fmt = $localize`dd/MM/yyyy`;
    }
    let ret = fmt;
    ret = ret.replace(/dddd/g, DatepickerPeriod.dowName(date));
    ret = ret.replace(/ddd/g, DatepickerPeriod.dowShortName(date));
    ret = ret.replace(/dd/g, Utils.pad(date?.getDate() ?? '--'));
    if (date == null) {
      ret = ret.replace(/MMMM/g, '????');
      ret = ret.replace(/MMM/g, '???');
      ret = ret.replace(/MM/g, '--');
    } else {
      ret = ret.replace(/MMMM/g, DatepickerPeriod.monthName(date));
      ret = ret.replace(/MMM/g, DatepickerPeriod.monthShortName(date));
      ret = ret.replace(/MM/g, Utils.pad(date?.getMonth() + 1));
    }
    ret = ret.replace(/yyyy/g, Utils.pad(date?.getFullYear() ?? '----', 4));
    ret = ret.replace(/hh/g, Utils.pad(date?.getHours() ?? '--'));
    ret = ret.replace(/mm/g, Utils.pad(date?.getMinutes() ?? '--'));
    ret = ret.replace(/ss/g, Utils.pad(date?.getSeconds() ?? '--'));
    ret = ret.replace(/sss/g, Utils.pad(date?.getMilliseconds() ?? '---'));
    return ret;
  }

  static isToday(date: Date) {
    const today = new Date();
    return date?.getFullYear() === today.getFullYear()
      && date?.getMonth() === today.getMonth()
      && date?.getDate() === today.getDate();
  }

  static isTodayOrBefore(date: Date) {
    if (date == null) {
      return true;
    }
    const today = new Date();
    return date?.getFullYear() <= today.getFullYear()
      && date?.getMonth() <= today.getMonth()
      && date?.getDate() <= today.getDate();
  }

  static getTime(date: Date = null) {
    if (date == null) {
      date = new Date();
    }
    return date.getHours() * 60 + date.getMinutes();
  }

  static nextListItem(item: string, list: string[]): string {
    if (list == null || list.length === 0) {
      return null;
    }
    const idx = list.findIndex(s => s === item);
    if (idx < 0 || idx === list.length - 1) {
      return list[0];
    }
    return list[idx + 1]
  }

  static isEmpty(text: any): boolean {
    if (text == null) {
      return true;
    }
    if (typeof text === 'string') {
      return text.trim() === '';
    }
    if (Array.isArray(text)) {
      return text.length === 0;
    }
    return false;
  }

  /**
   * compare two values
   * @param a first value
   * @param b second value
   * @returns
   * 0 if a === b
   * -1 if a < b
   * 1 if a > b
   */
  static compare(a: any, b: any): number {
    if (a === b) {
      return 0;
    }
    return (a < b) ? -1 : 1;
  }

  /**
   * compare two dates
   * @param a first date
   * @param b second date
   * @returns
   * 0 if a === b
   * -1 if a < b
   * 1 if a > b
   */
  static compareDate(a: Date, b: Date): number {
    return Utils.compare(a?.getTime(), b?.getTime());
  }

  static join(dst: string[], separator: string, convert?: (text: string) => string) {
    if (convert != null) {
      const cvt = [];
      for (const text of dst) {
        cvt.push(convert(text));
      }
      dst = cvt;
    }
    return dst.join(separator);
  }

  static decimalPlaces(value: number): number {
    let v = `${value}`;
    while (v.endsWith('0')) {
      v = v.substring(0, v.length - 1);
    }
    const ret = Math.max(v.length - v.lastIndexOf('.') - 1, 0);
    return Math.min(ret, 3);
  }

  static isAfter(later: Date, earlier: Date): boolean {
    return later?.getTime() > earlier?.getTime();
  }

  static isBeforeDate(earlier: Date, later: Date): boolean {
    const e = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate(), 0, 0, 0, 0);
    const l = new Date(later.getFullYear(), later.getMonth(), later.getDate(), 0, 0, 0, 0);
    return e?.getTime() < l?.getTime();
  }

  static isAfterDate(earlier: Date, later: Date): boolean {
    const e = new Date(earlier.getFullYear(), earlier.getMonth(), earlier.getDate(), 0, 0, 0, 0);
    const l = new Date(later.getFullYear(), later.getMonth(), later.getDate(), 0, 0, 0, 0);
    return e?.getTime() > l?.getTime();
  }

  static isBefore(earlier: Date, later: Date): boolean {
    return earlier?.getTime() < later?.getTime();
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1?.getFullYear() === date2?.getFullYear()
      && date1?.getMonth() === date2?.getMonth()
      && date1?.getDate() === date2?.getDate();
  }

  static isSameMoment(date1: Date, date2: Date): boolean {
    return date1?.getTime() === date2?.getTime();
  }

  static isOnOrBeforeDate(earlier: Date, later: Date): boolean {
    return Utils.isBeforeDate(earlier, later) || Utils.isSameDay(earlier, later);
  }

  static isOnOrBefore(earlier: Date, later: Date): boolean {
    return this.isBefore(earlier, later) || this.isSameDay(later, earlier);
  }

  static isOnOrAfterDate(earlier: Date, later: Date): boolean {
    return Utils.isAfterDate(earlier, later) || Utils.isSameDay(earlier, later);
  }

  static isOnOrAfter(later: Date, earlier: Date): boolean {
    return this.isAfter(later, earlier) || this.isSameDay(later, earlier);
  }

  static isBetween(date: Date, start: Date, end: Date): boolean {
    return this.isOnOrAfter(date, start) && this.isOnOrBefore(date, end);
  }

  static differenceInDays(later: Date, earlier: Date): number {
    const ret = later?.getTime() - earlier?.getTime();
    return Math.floor(ret / 1000 / 60 / 60 / 24);
  }

  static differenceInSeconds(later: Date, earlier: Date): number {
    const ret = later?.getTime() - earlier?.getTime();
    return Math.floor(ret / 1000);
  }

  static differenceInMinutes(later: Date, earlier: Date): number {
    const ret = later?.getTime() - earlier?.getTime();
    return Math.floor(ret / 1000 / 60);
  }

  static differenceInHours(later: Date, earlier: Date): number {
    const ret = later?.getTime() - earlier?.getTime();
    return Math.floor(ret / 1000 / 60 / 60);
  }

  static differenceInMilliseconds(later: Date, earlier: Date): number {
    return later?.getTime() - earlier?.getTime();
  }

  static findLast<T>(list: T[], method: (e: T) => boolean) {
    const temp = list.filter(method);
    if (temp != null && temp.length > 0) {
      return Utils.last(temp);
    }
    return null;
  }

  static plural(value: number, options: any): string {
    return options[value] ?? options.other;
  }

  static jsonize(data: any) {
    return JSON.parse(JSON.stringify(data));
  }

  static rnd(max: number): number {
    return Math.floor(Math.random() * max);
  }

  static encodeBase64(src: string, failRet: string = null): string {
    let ret;
    // btoa allein reicht an dieser Stelle nicht, weil dadurch Umlaute nicht korrekt
    // konvertiert werden.
    try {
      const encoder = new TextEncoder();
      const bytes = new Uint8Array(encoder.encode(src));
      ret = btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ''));
    } catch (ex) {
      Log.devError(ex, 'Fehler in Utils.encodeBase64');
      ret = failRet;
    }
    return ret;
  }

  static cvtMultilineText(text: string): string {
    if (text != null) {
      text = text.replace(/\n/g, 'µ') ?? '';
      text = text.replace(/µµ/g, '<br><br>');
      text = text.replace(/µ/g, ' ');
    }
    return text;
  }

  static decodeBase64(src: string, failRet: string = null): string {
    let ret;
    // atob alleine reicht an dieser Stelle nicht, weil dadurch Umlaute nicht korrekt
    // konvertiert werden.
    try {
      src = atob(src);
      const decoder = new TextDecoder();
      const buf = new ArrayBuffer(src.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < src.length; i++) {
        bufView[i] = src.charCodeAt(i);
      }
      ret = decoder.decode(bufView);
    } catch (ex) {
      Log.devError(ex, 'Fehler in Utils.decodeBase64');
      ret = failRet;
    }
    return ret;
  }

  static parseNumber(value: string, def?: number) {
    let ret = Number(value);
    if (isNaN(ret)) {
      ret = def ?? 0;
    }
    return ret;
  }

  static pushArgs(src: any, dst: any) {
    if (src != null) {
      for (const key of Object.keys(src)) {
        if (src[key] != null) {
          dst[key] = src[key];
        }
      }
    }
  }

  /**
   * Converts kebab-case to camelCase
   * @param value text in kebab-case
   */
  static kebabToCamel(value: string): string {
    return value.replace(/(.*?)-([a-zA-Z])/g, (s, ...args) => `${args[0]}${args[1].toUpperCase()}`);
  }

  /**
   * Converts snake_case to camelCase
   * @param value text in snake_case
   */
  static snakeToCamel(value: string): string {
    return value.replace(/(.*?)_([a-zA-Z])/g, (s, ...args) => `${args[0]}${args[1].toUpperCase()}`);
  }

  /**
   * Converts camelCase to snake_case
   * @param value text in camelCase
   */
  static camelToSnake(value: string): string {
    return value.replace(/(.+?)([A-Z])/g, (s, ...args) => `${args[0]}_${args[1].toLowerCase()}`);
  }

  /**
   * Converts camelCase to kebab-case
   * @param value text in camelCase
   */
  static camelToKebab(value: string): string {
    return value.replace(/(.+?)([A-Z])/g, (s, ...args) => `${args[0]}-${args[1].toLowerCase()}`);
  }

  static wordify(text: string, maxchars: number): string[] {
    const ret: string[] = [];
    text = Utils.cvtMultilineText(text);
    const words = text.split(' ');
    let line = '';
    let diff = '';
    for (const word of words) {
      if (line.length + word.length > maxchars) {
        ret.push(line);
        line = word;
      } else {
        line += diff + word;
        diff = ' ';
      }
    }
    ret.push(line);
    return ret;
  }

  static limit(value: number, min: number, max: number): number {
    while (value < min) {
      value += (max - min);
    }
    while (value > max) {
      value -= (max - min);
    }
    return value;
  }

  static isNumeric(value: string): boolean {
    return /^\d+$/.test(value);
  }

  static urlParams(data: any): string {
    const ret: string[] = [];
    for (const key of Object.keys(data ?? {})) {
      ret.push(`${key}=${data[key]}`);
    }
    return Utils.join(ret, '&');
  }
}
