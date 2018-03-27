import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder } from '@angular/forms';
import { leafletDrawOption } from '@geonature_common/map/leaflet-draw.options';

@Component({
  selector: 'pnx-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit {
  formGroup: FormGroup;
  leafletDrawOption: any;
  constructor(private _fb: FormBuilder) {}

  ngOnInit() {
    this.formGroup = this._fb.group({
      nomenclature: null,
      observer: null,
      cd_nom: null,
      jdd: null,
      date: null
    });
  }
}
