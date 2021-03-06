import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AlertModule, TooltipModule, ProgressbarModule } from 'ng2-bootstrap/ng2-bootstrap';

import { AppComponent } from './app.component';
import { GameComponent } from './game/game.component';

import { routing } from './app.routing';

@NgModule({
  declarations: [
    AppComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    AlertModule,
    TooltipModule,
    ProgressbarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
