import {Component, OnInit} from '@angular/core';
import {LinkDef, Log} from '@/_services/log.service';
import {CommonModule} from '@angular/common';
import {MaterialModule} from '@/material.module';
import {FormsModule} from '@angular/forms';
import {LogPipe} from '@/components/log/log.pipe';
import {GLOBALS, GlobalsService} from '@/_services/globals.service';
import {PdfService} from '@/_services/pdf.service';

@Component({
  imports: [CommonModule, MaterialModule, FormsModule, LogPipe],
  standalone: true,
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  constructor(public globals: GlobalsService,
              public ps: PdfService) {
  }

  get msg(): { [key: string]: any[] } {
    return Log.msg;
  };

  get links(): LinkDef[] {
    return Log.links;
  }

  typeOf(line: any): string {
    if (typeof line === 'string') {
      return 'string';
    }
    return '';
  }

  onClickDelete(event: Event, type: string): void {
    event.preventDefault();
    Log.clear(type);
  }

  ngOnInit(): void {
  }

  showType(type: string) {
    let ret = this.msg[type].length > 0;
    if (ret && ['debug', 'todo'].includes(type) && !GLOBALS.isDebug) {
      return false;
    }
    return ret;
  }

  toBinary(text: string): string {
    const codeUnits = Uint16Array.from(
      {length: text.length},
      (element, index) => text.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);

    let result = '';
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  openLink(link: LinkDef) {
    switch (link.url) {
      case 'showPdf':
        this.ps.showPdf(link.data);
        return;
      case 'showPlayground':
        // 'http://pdf.zreptil.de/playground.php'
        let doc = JSON.stringify(link.data);
        if (doc != null) {
          doc = doc.replace(/],/g, '],\n');
          doc = doc.replace(/,"/g, ',\n"');
          doc = doc.replace(/:\[/g, ':\n[');
        }
        console.log(link.data);
        doc = btoa(encodeURIComponent(doc).replace(/%([0-9A-F]{2})/g, function (match, p1) {
          return String.fromCharCode(parseInt(p1, 16))
        }));
        // try {
        //   doc = btoa(doc);
        // } catch (ex) {
        //   console.error(ex, doc);
        // }
        const params: any = {
          data: doc,
          filename: ''
        }

        const form = document.createElement('form');
        form.target = '_blank';
        form.method = 'POST';
        form.action = GLOBALS.urlPlayground;
        for (const key of Object.keys(params)) {
          const inp = document.createElement('input');
          inp.type = 'hidden';
          inp.name = key;
          inp.value = params[key];
          form.appendChild(inp);
          document.body.appendChild(form);
        }
        form.submit();
        return;
    }
    window.open(link.url);
  }

  classForLine(line: any): string[] {
    const ret: string[] = [];
    if (line?._ != null) {
      ret.push('nobottomline');
    }
    return ret;

  }
}
