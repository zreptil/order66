import {Injectable} from '@angular/core';
import {Utils} from '@/classes/utils';

export class CalendarOptions {
  title: string;
  from: string;
  to: string;
  details: string;
  location: string;
}

export class GoogleMapsOptions {
  address?: string;
  label?: string;
  zoom?: number;
  width?: number;
  height?: number;
}

@Injectable({
  providedIn: 'root'
})
export class GoogleLinkService {
  private apiKeys = {
    maps: 'AIzaSyCiezSySm7kNjdBarx16IQ06gneReCGbz8'
  };

  constructor() {

  }

  mapImageUrl(options: GoogleMapsOptions): string {
    const ret = [];
    if (options?.address != null) {
      ret.push(`center=${options.address}`);
      ret.push(`markers=color:red|label:${options?.label?.substring(0, 1) ?? 'C'}|${options.address}`);
    }
    ret.push(`size=${options?.width ?? 500}x${options?.height ?? 500}`);
    ret.push(`key=${this.apiKeys.maps}`);
    if (options?.zoom != null) {
      ret.push(`zoom=${options.zoom}`);
    }
    ret.push('format=png');
    ret.push('style=feature:poi|visibility:off&style=feature:transit|visibility:off');
    return `https://maps.googleapis.com/maps/api/staticmap?${Utils.join(ret, '&')}`;
  }

  mapsUrl(options: GoogleMapsOptions): string {
    const ret = [];
    if (options?.address != null) {
      ret.push(`${options.address}`);
      // ret.push(`markers=color:red|label:${options?.label?.substring(0, 1) ?? 'C'}|${options.address}`);
    }
    return `https://www.google.com/maps/place/${Utils.join(ret, '&')}`;
  }

  mapsRouteUrl(from: string, to: string): string {
    return `https://www.google.com/maps/dir/${from}/${to}`;
  }

  calendarAddEntryUrl(options: CalendarOptions): string {
    const ret = {
      text: options.title,
      dates: `${options.from}/${options.to}`,
      details: options.details,
      location: options.location,
    };
    return `https://calendar.google.com/calendar/r/eventedit?${Utils.urlParams(ret)}`;
  }

  calendarShowUrl(date: Date): string {
    return `https://www.google.com/calendar/u/0/r/month/${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }
}
