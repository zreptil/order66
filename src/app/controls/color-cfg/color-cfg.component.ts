import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {MessageService} from '@/_services/message.service';
import {ColorCfgDialogComponent} from '@/controls/color-cfg/color-cfg-dialog/color-cfg-dialog.component';

@Component({
  selector: 'color-cfg',
  templateUrl: './color-cfg.component.html',
  styleUrls: ['./color-cfg.component.scss'],
  standalone: false
})
export class ColorCfgComponent {

  @ViewChild('input') input: ElementRef;

  @Input() colorKey: string;

  constructor(public msg: MessageService) {
  }

  showDialog() {
    this.msg.showPopup(ColorCfgDialogComponent, 'colorcfgdialog', {colorKey: this.colorKey});
  }
}
