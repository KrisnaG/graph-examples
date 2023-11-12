import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public title = 'App';
  public selectedGraph: string = '2';
  public selectedData: string = 'dummy.json';
}
