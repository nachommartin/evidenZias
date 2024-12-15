import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PickListModule } from 'primeng/picklist';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from "primeng/dialog";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SplitButton } from 'primeng/splitbutton';




@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PickListModule,
    DragDropModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    SplitButton
      ],
  providers: [MessageService, provideHttpClient(), provideAnimationsAsync(),
    providePrimeNG({ 
        theme: {
            preset: Aura
        }
    })],
  bootstrap: [AppComponent]
})
export class AppModule { }
