import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {DialogComponent} from '@/components/dialog/dialog.component';
import {ColorPickerComponent} from '@/controls/color-picker/color-picker.component';
import {ColorPickerImageComponent} from '@/controls/color-picker/color-picker-image/color-picker-image.component';
import {ColorPickerMixerComponent} from '@/controls/color-picker/color-picker-mixer/color-picker-mixer.component';
import {ColorPickerBaseComponent} from '@/controls/color-picker/color-picker-base.component';
import {WelcomeComponent} from '@/components/welcome/welcome.component';
import {MainComponent} from '@/components/main/main.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {MaterialModule} from '@/material.module';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {LogComponent} from '@/components/log/log.component';
import {WhatsNewComponent} from '@/components/whats-new/whats-new.component';
import {ImpressumComponent} from '@/components/impressum/impressum.component';
import {ProgressComponent} from '@/components/progress/progress.component';
import {AutofocusDirective} from '@/_directives/autofocus.directive';
import {ColorPickerDialog} from '@/controls/color-picker/color-picker-dialog/color-picker-dialog';
import {ColorCfgComponent} from '@/controls/color-cfg/color-cfg.component';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';
import {CloseButtonComponent} from '@/controls/close-button/close-button.component';
import {ColorPickerSliderComponent} from '@/controls/color-picker/color-picker-slider/color-picker-slider.component';
import {ColorPickerHslComponent} from '@/controls/color-picker/color-picker-hsl/color-picker-hsl.component';
import {SettingsComponent} from '@/components/settings/settings.component';
import {PersonFormComponent} from '@/controls/person-form/person-form.component';
import {TypeOwnerComponent} from '@/components/type-owner/type-owner.component';
import {TypeSitterComponent} from '@/components/type-sitter/type-sitter.component';
import {PlanComponent} from '@/components/plan/plan.component';
import {DatepickerComponent} from '@/controls/datepicker/datepicker.component';
import {DatepickerDialogComponent} from '@/controls/datepicker/datepicker-dialog/datepicker-dialog.component';
import {DatepickerMonthComponent} from '@/controls/datepicker/datepicker-month/datepicker-month.component';

@NgModule({
  declarations: [
    AutofocusDirective,
    AppComponent,
    DialogComponent,
    ColorPickerComponent,
    ColorPickerDialog,
    ColorPickerImageComponent,
    ColorPickerMixerComponent,
    ColorPickerBaseComponent,
    ColorPickerSliderComponent,
    ColorPickerHslComponent,
    ColorCfgComponent,
    ColorCfgDialogComponent,
    CloseButtonComponent,
    DatepickerComponent,
    DatepickerDialogComponent,
    DatepickerMonthComponent,
    WhatsNewComponent,
    MainComponent,
    WelcomeComponent,
    SettingsComponent,
    ImpressumComponent,
    PersonFormComponent,
    TypeOwnerComponent,
    TypeSitterComponent,
    PlanComponent
  ],
  bootstrap: [AppComponent], imports: [BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    MaterialModule,
    DragDropModule,
    LogComponent,
    ProgressComponent], providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule {
}
