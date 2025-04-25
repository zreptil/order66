import {GlobalsService} from '@/_services/globals.service';

export abstract class DlgBaseComponent {
  constructor(public globals: GlobalsService,
              public readonly name: string) {
  }
}
