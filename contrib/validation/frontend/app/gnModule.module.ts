import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { Routes, RouterModule } from "@angular/router";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { Http } from "@angular/http";
// Components
import { ValidationMapFormComponent } from "./validation-map-form/validation-map-form.component";
import { ReleveComponent } from "./validation-map-form/form/releve/releve.component";
import { CountingComponent } from "./validation-map-form/form/counting/counting.component";
import { OccurrenceComponent } from "./validation-map-form/form/occurrence/occurrence.component";
import { ValidationFormComponent } from "./validation-map-form/form/validation-form.component";
import { TaxonsListComponent } from "./validation-map-form/form/taxons-list/taxons-list.component";
import { ValidationMapListComponent } from "./validation-map-list/validation-map-list.component";
import { ValidationMapInfoComponent } from "./validation-map-info/validation-map-info.component";
// Service
import { ValidationFormService } from "./validation-map-form/form/validation-form.service";
import { ValidationService } from "./services/validation.service";

const routes: Routes = [
  { path: "", component: ValidationMapListComponent },
  { path: "form", component: ValidationMapFormComponent },
  { path: "form/:id", component: ValidationMapFormComponent, pathMatch: "full" },
  { path: "info/:id", component: ValidationMapInfoComponent, pathMatch: "full" }
];

@NgModule({
  imports: [CommonModule, GN2CommonModule, RouterModule.forChild(routes)],
  declarations: [
    ValidationMapFormComponent,
    ValidationFormComponent,
    ValidationMapInfoComponent,
    ReleveComponent,
    CountingComponent,
    OccurrenceComponent,
    TaxonsListComponent,
    ValidationMapListComponent
  ],
  providers: [ValidationFormService, ValidationService],
  bootstrap: [ValidationMapFormComponent]
})
export class GeonatureModule {}

