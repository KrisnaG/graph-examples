import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ForceGraphComponent } from './force-graph/force-graph.component';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PackWithArrowComponent } from './pack-with-arrow/pack-with-arrow.component';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        AppComponent,
        ForceGraphComponent,
        PackWithArrowComponent
    ],
    imports:[ 
        BrowserModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }