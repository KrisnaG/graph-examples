import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'App';
  public selectedGraph: string = '3';
  public selectedData: string = 'dummy2.json';
}
