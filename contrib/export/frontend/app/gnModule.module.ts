import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GN2CommonModule } from "@geonature_common/GN2Common.module";
import { Routes, RouterModule } from "@angular/router";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { Http } from "@angular/http";
// Components
import { ExportMapFormComponent } from "./export-map-form/export-map-form.component";
import { ReleveComponent } from "./export-map-form/form/releve/releve.component";
import { CountingComponent } from "./export-map-form/form/counting/counting.component";
import { OccurrenceComponent } from "./export-map-form/form/occurrence/occurrence.component";
import { ExportFormComponent } from "./export-map-form/form/export-form.component";
import { TaxonsListComponent } from "./export-map-form/form/taxons-list/taxons-list.component";
import { ExportMapListComponent } from "./export-map-list/export-map-list.component";
import { ExportMapInfoComponent } from "./export-map-info/export-map-info.component";
// Service
import { ExportFormService } from "./export-map-form/form/export-form.service";
import { ExportService } from "./services/export.service";

const routes: Routes = [
  { path: "", component: ExportMapListComponent },
  { path: "form", component: ExportMapFormComponent },
  { path: "form/:id", component: ExportMapFormComponent, pathMatch: "full" },
  { path: "info/:id", component: ExportMapInfoComponent, pathMatch: "full" }
];

@NgModule({
  imports: [CommonModule, GN2CommonModule, RouterModule.forChild(routes)],
  declarations: [
    ExportMapFormComponent,
    ExportFormComponent,
    ExportMapInfoComponent,
    ReleveComponent,
    CountingComponent,
    OccurrenceComponent,
    TaxonsListComponent,
    ExportMapListComponent
  ],
  providers: [ExportFormService, ExportService],
  bootstrap: [ExportMapFormComponent]
})
export class GeonatureModule {}

