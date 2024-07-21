import {Log} from '@/_services/log.service';

export class ThemeData {
  /**
   * the icons for the special keys
   */
  static icons: any = {
    back: 'water_drop',
    fore: 'title',
    data: 'edit_note',
    link: 'link',
    subhead: 'format_bold'
  }
  /**
   * collection of colorkey-endings for specialGroups
   */
  static specialKeys: any = {
    Fore: {icon: ThemeData.icons.fore, title: $localize`Text`},
    Data: {icon: ThemeData.icons.data, title: $localize`Data`},
    Link: {icon: ThemeData.icons.link, title: $localize`Link`},
    SubHead: {icon: ThemeData.icons.subhead, title: $localize`Headline`},
  };
  /**
   * all colorkeys that end with a key from specialGroups will
   * be shown in the colorDialog as one line with all of the colors
   * that have the same colorkey up to the key ending with one of
   * the entries in keys.
   * e.g. mainBodyBack will contain in one line
   * mainBodyBack, mainBodyFore, mainBodyData, mainBodyLink, mainBodySubHead
   */
  static specialGroups: any = {
    Back: {keys: ThemeData.specialKeys, title: $localize`Background`},
    RGB: {keys: ThemeData.specialKeys, title: $localize`Background`},
    Frame: {keys: ThemeData.specialKeys, title: $localize`Frame`}
  };
  /**
   * the names for the given colors
   */
  static colorData: any = {
    mainHead: {title: $localize`Title`},
    mainBody: {title: $localize`Content`},
    settingsHead: {title: $localize`Title`},
    settingsBody: {title: $localize`Content`},
    settingsError: {title: $localize`Error`},
    legalHead: {title: $localize`Title`},
    legalBody: {title: $localize`Content`},
    whatsnewHead: {title: $localize`Title`},
    whatsnewBody: {title: $localize`Content`},
    local: {title: $localize`Local`, debugOnly: true},
    betaBack: {title: $localize`Beta`},
    helpHead: {title: $localize`Title`},
    helpBody: {title: $localize`Content`},
    datepickerBtnEmpty: {title: $localize`Empty Period`},
    datepickerHeadEmpty: {title: $localize`Titlearea for emtpy date`},
    datepickerHead: {title: $localize`Title`},
    datepickerBodyBack: {title: $localize`Content`},
    datepickerMonthTitle: {title: $localize`Month Title`},
    datepickerMonth: {title: $localize`Month Content`},
    datepickerBtnRaised: {title: $localize`Marked Day`},
    datepickerBtnRaisedKey: {title: $localize`Marked relative Period`},
    datepickerBtnShiftKey: {title: $localize`Shift`},
    datepickerDowActive: {title: $localize`Active Weekday`},
    datepickerDowInactive: {title: $localize`Inactive Weekday`},
    datepickerBody: {title: $localize`Background`},
    mainDonate: {title: $localize`Donationbutton`},
    logDebug: {title: $localize`Debug`},
    dlgErrorHead: {title: $localize`Dialog Error Title`},
    dlgErrorBody: {title: $localize`Dialog Error Content`},
    dlgWarnHead: {title: $localize`Dialog Warning Title`},
    dlgWarnBody: {title: $localize`Dialog Warning Content`},
  };
  /**
   * the labels and parameters for the colorkeys
   */
  static colorMapping: any = {
    datepicker: {title: $localize`Datepicker`},
    google: {title: $localize`Google`},
    info: {title: $localize`Info`},
    help: {title: $localize`Help`},
    legal: {title: $localize`Legal`},
    whatsnew: {title: $localize`Once upon a time...`},
    shortcut: {title: $localize`Shortcut`},
    settings: {title: $localize`Settings`},
    log: {title: $localize`Log`, debugOnly: true},
    local: {title: $localize`Local`, debugOnly: true},
    beta: {title: $localize`Beta`, debugOnly: true},
    debug: {title: $localize`Debug`, debugOnly: true},
    main: {title: $localize`Mainpage`},
    dlgError: {title: $localize`Dialog`},
    user: {title: $localize`User`},
    dialog: {title: $localize`Dialog`},
  }

  /**
   * the colorkeys given here are additionally displayed
   * in the color-selection-dialog for the given colorkey
   */
  static additionalColorsFor: any = {
    outputparams: ['settingsLoopMarked', 'datepickerBtnEmpty'],
    main: ['userPinFore', 'local', 'beta', 'log'],
    settings: ['userPinFore'],
    watchsettings: ['settingsHead', 'settingsBody', '@glucNorm', 'glucLow', 'glucHigh', 'glucUnknown'],
    dialog: [
      'mainHeadBack', 'mainHeadFore', 'mainBodyBack', 'mainBodyFore',
      'dlgErrorHeadBack', 'dlgErrorHeadFore', 'dlgErrorBodyBack', 'dlgErrorBodyFore',
      'dlgWarnHeadBack', 'dlgWarnHeadFore', 'dlgWarnBodyBack', 'dlgWarnBodyFore'
    ]
  };
}
