import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent, LeadDialog } from './header/header.component';
import { RouterModule,Routes } from '@angular/router';
import { MaterialModule } from '../material/material.module';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { DemoMaterialModule } from '../material/material-module';
import { FormsModule } from '@angular/forms';
const routes: Routes = [

]

@NgModule({
  declarations: [HeaderComponent, SnackbarComponent, LeadDialog],
  imports: [
    CommonModule,RouterModule.forChild(routes),MaterialModule, DemoMaterialModule,
    FormsModule
  ],
  exports: [HeaderComponent,RouterModule]
})
export class SharedModule { }
