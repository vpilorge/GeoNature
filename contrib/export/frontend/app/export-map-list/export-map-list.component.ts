import {
  NgModule,
  Component,
  Renderer2,
  ViewChild,
  Pipe,
  PipeTransform
} from "@angular/core";
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import { Router } from "@angular/router";
import { Http } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { TranslateService } from "@ngx-translate/core";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { CommonService } from "@geonature_common/service/common.service";
import { TaxonomyComponent } from "@geonature_common/form/taxonomy/taxonomy.component";
import { DynamicFormComponent } from "@geonature_common/form/dynamic-form/dynamic-form.component";
import { DynamicFormService } from "@geonature_common/form/dynamic-form/dynamic-form.service";
import { ColumnActions } from "@geonature_common/map-list/map-list.component";
import { MapListService } from "@geonature_common/map-list/map-list.service";
import { FILTERSLIST } from "./filters-list";
import { ExportService } from "../services/export.service";


const apiEndpoint='http://localhost:8000/interop';

@Component({
  selector: "pnx-export-map-list",
  templateUrl: "export-map-list.component.html",
  styleUrls: ["./export-map-list.component.scss"],
  providers: [MapListService]
})
export class ExportMapListComponent {
  public modalForm : FormGroup;
  public displayColumns: Array<any>;
  public availableColumns: Array<any>;
  public pathEdit: string;
  public pathInfo: string;
  public idName: string;
  public apiEndPoint: string;
  public columnActions: ColumnActions;
  public formsDefinition = FILTERSLIST;
  public dynamicFormGroup: FormGroup;
  public filterControl = new FormControl();
  public formsSelected = [];
  public buttonDisabled: boolean = false;
  public barHide: boolean = false;

  public varExport1 = "Export n°1";
  public varExport2 = "Export n°2";
  public varExport3 = "Export n°3";
  public varExport4 = "Export n°4";
  public varExport5 = "Export n°5";
  public varExport6 = "Export n°6";

  public today = Date.now();
  advandedFilterOpen = false;
  @ViewChild(NgbModal) public modalCol: NgbModal;
  constructor(
    private _http: Http,
    private mapListService: MapListService,
    private _exportService: ExportService,
    private _commonService: CommonService,
    private _translate: TranslateService,
    private _router: Router,
    public ngbModal: NgbModal,
    private _fb: FormBuilder,
    private _dynformService: DynamicFormService ){

    this.modalForm = this._fb.group({
      adresseMail:['', Validators.compose([Validators.required, Validators.email])]
    })

  }

  openModalCol(event, modal) {
    this.ngbModal.open(modal);
  }

  //Fonction qui bloque le boutton de validation tant que la licence n'est pas checkée
  follow(){
    this.buttonDisabled = !this.buttonDisabled;
  }

  //Fonction qui affiche la barre de téléchargement après validation
  showme(){
    this.barHide = !this.barHide;
    if (!this.barHide) {
      // FIXME: get checked export
      this.getExportProgress(1527763714.449634)
    }
  }

  //Fonction pour avoir un modal vierge si l'on ferme puis réouvre le modal
  resetModal(){
    this.modalForm.reset();
  }

  //Fonction pour envoyer un mail à l'utilisateur lorsque le ddl est terminé.
  get adresseMail() { return this.modalForm.get('adresseMail'); }

  getExportProgress(submissionID: number) {
    let progress = Observable.interval(1500)
      .switchMap(() => this._http.get(apiEndpoint + '/progress/' + submissionID))
      .map(data => data.json())
      .takeWhile(data => data.status === '-2')
      .subscribe(
        data => console.debug(data),
        error => console.error(error),
        () => {
          progress.unsubscribe();
          window.location.href = apiEndpoint + '/exports/export_' + submissionID + '.csv';
        }
      );
    }
  }

}
