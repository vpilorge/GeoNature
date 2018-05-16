import { Component, OnInit, OnDestroy, ViewChild,ElementRef } from "@angular/core";
import { Http } from "@angular/http";
import { GeoJSON } from "leaflet";
import { MapListService } from "@geonature_common/map-list/map-list.service";
import { Subscription } from "rxjs/Subscription";
import { ExportService } from "../services/export.service";
import { CommonService } from "@geonature_common/service/common.service";
import { TranslateService } from "@ngx-translate/core";
import { Router } from "@angular/router";
import { FormControl } from "@angular/forms";
import { ColumnActions } from "@geonature_common/map-list/map-list.component";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { ExportConfig } from "../export.config";
import { TaxonomyComponent } from "@geonature_common/form/taxonomy/taxonomy.component";
import { DatatableComponent } from "@swimlane/ngx-datatable";
import { FormGroup, FormBuilder } from "@angular/forms";
import { DynamicFormComponent } from "@geonature_common/form/dynamic-form/dynamic-form.component";
import { DynamicFormService } from "@geonature_common/form/dynamic-form/dynamic-form.service";
import { FILTERSLIST } from "./filters-list";
import { Directive, Renderer2} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: "pnx-export-map-list",
  templateUrl: "export-map-list.component.html",
  styleUrls: ["./export-map-list.component.scss"],
  providers: [MapListService]
})

export class ExportMapListComponent implements OnInit {
  public modalForm : FormGroup;
  public licence: string;
  public displayColumns: Array<any>;
  public availableColumns: Array<any>;
  public pathEdit: string;
  public pathInfo: string;
  public idName: string;
  public apiEndPoint: string;
  public columnActions: ColumnActions;
  public exportConfig: any;
  public formsDefinition = FILTERSLIST;
  public dynamicFormGroup: FormGroup;
  public filterControl = new FormControl();
  public formsSelected = [];
  public buttonDisabled: boolean = false;
  public barHide: boolean = false;
  // provisoire
  public tableMessages = {
    emptyMessage: "Aucune observation à afficher",
    totalMessage: "observation(s) au total"
  };

  public varExport1 = "Export n°1";
  public varExport2 = "Export n°2";
  public varExport3 = "Export n°3";
  public varExport4 = "Export n°4";
  public varExport5 = "Export n°5";
  public varExport6 = "Export n°6";

  public today = Date.now();
  
  advandedFilterOpen = false;
  @ViewChild(NgbModal) public modalCol: NgbModal;
  @ViewChild(TaxonomyComponent) public taxonomyComponent: TaxonomyComponent;
  constructor(
    private _http: Http,
    private mapListService: MapListService,
    private _exportService: ExportService,
    private _commonService: CommonService,
    private _translate: TranslateService,
    private _router: Router,
    public ngbModal: NgbModal,
    private _fb: FormBuilder,
    private _dynformService: DynamicFormService
  ) {}

  addFormControl(formDef) {
    this.formsSelected.push(formDef);
    this.formsDefinition = this.formsDefinition.filter(form => {
      return form.key != formDef.key;
    });
    this._dynformService.addNewControl(formDef, this.dynamicFormGroup);
    console.log(this.dynamicFormGroup);
  }

  removeFormControl(i) {
    const formDef = this.formsSelected[i];
    this.formsSelected.splice(i, 1);
    this.formsDefinition.push(formDef);
    this.dynamicFormGroup.removeControl(formDef.key);
    this.filterControl.setValue(null);
  }

  openModalCol(event, modal) {
    this.ngbModal.open(modal);
  }

  follow(){
    this.buttonDisabled = !this.buttonDisabled;
  }

  showme(){
    this.barHide = !this.barHide;
  }

  resetModal(){
    this.modalForm.reset(); 
  }
}





