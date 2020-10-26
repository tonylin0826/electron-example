import { Component, NgZone, OnInit } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  data = '';

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    private zone: NgZone,
  ) {
    this.translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);

    } else {
      console.log('Run in browser');
    }
  }

  async ngOnInit(): Promise<void> {
    const { fs } = this.electronService;
    fs.readFile('/Users/tony/myself/electron-example/package.json', this.onFileRead.bind(this));

    await this.electronService.ipcRenderer.invoke('test-handle');
  }

  @AppComponent.forceInZone()
  onFileRead(err: Error, data: Buffer): void {
    if (err) {
      this.data = err.message;
      return;
    }

    this.data = data.toString();
  }

  static forceInZone(): MethodDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target: Function, key: string, descriptor: any) {

      const originalMethod = descriptor.value;
      descriptor.value = function (...args: any[]) {
        this.zone.run(() => {
          originalMethod.apply(this, args);
        })
      }

      return descriptor;
    }
  }
}
