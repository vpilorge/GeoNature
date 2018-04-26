import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AppConfig } from '../../../conf/app.config';
import { Observable } from 'rxjs';
import { CommonService } from '@geonature_common/service/common.service';
import * as L from 'leaflet';
import { FormControl } from '@angular/forms';
import { MapService } from '@geonature_common/map/map.service';
import { Map } from 'leaflet';

@Injectable()
export class MapListService {
  public tableSelected = new Subject<any>();
  public mapSelected = new Subject<any>();
  public selectedRow = [];
  public data: any;
  public tableData = new Array();
  public geojsonData: any;
  public idName: string;
  public columns = [];
  public layerDict = {};
  public selectedLayer: any;
  public onMapClik$: Observable<number> = this.mapSelected.asObservable();
  public onTableClick$: Observable<number> = this.tableSelected.asObservable();
  public urlQuery: HttpParams = new HttpParams();
  public page = new Page();
  public genericFilterInput = new FormControl();
  filterableColumns: Array<any>;
  availableColumns: Array<any>;
  displayColumns: Array<any>;
  colSelected: any;
  allColumns: Array<any>;
  customCallBack: any;

  originStyle = {
    color: '#3388ff',
    fill: true,
    fillOpacity: 0.2,
    weight: 3
  };

  selectedStyle = {
    color: '#ff0000',
    weight: 3
  };
  constructor(
    private _http: HttpClient,
    private _commonService: CommonService,
    private _ms: MapService
  ) {
    this.columns = [];
    this.page.pageNumber = 0;
    this.page.size = 12;
    this.urlQuery.set('limit', '12');
    this.urlQuery.set('offset', '0');
    this.colSelected = { prop: '', name: '' };
  }

  enableMapListConnexion(map: Map): void {
    // do the connexion between map and list
    this.onTableClick$.subscribe(id => {
      const selectedLayer = this.layerDict[id];
      this.toggleStyle(selectedLayer);
      this.zoomOnSelectedLayer(map, selectedLayer);
    });

    this.onMapClik$.subscribe(id => {
      this.selectedRow = []; // clear selected list
      for (const i in this.tableData) {
        if (this.tableData[i][this.idName] === id) {
          this.selectedRow.push(this.tableData[i]);
        }
      }
    });
  }

  onRowSelect(row) {
    // row can be an object from ngx-datatable or an integer
    if (row instanceof Object) {
      this.tableSelected.next(row.selected[0][this.idName]);
    } else {
      this.tableSelected.next(row);
    }
  }

  getRowClass() {
    return 'clickable';
  }

  setTablePage(pageInfo, endPoint) {
    this.page.pageNumber = pageInfo.offset;
    this.urlQuery = this.urlQuery.set('offset', pageInfo.offset);
    this.refreshData(endPoint, 'set');
  }

  // fetch the data
  loadData(endPoint, param?) {
    return this._http.get<any>(`${AppConfig.API_ENDPOINT}/${endPoint}`, { params: this.urlQuery });
  }

  getData(endPoint, param?: Array<any>, customCallBack?) {
    //  params: parameter to filter on the api
    //  customCallBack: function which return a feature to custom the content of the table
    this.manageUrlQuery('set', param);
    this.customCallBack = customCallBack;
    this.loadData(endPoint, param).subscribe(
      data => {
        this.page.totalElements = data.total_filtered;
        this.geojsonData = data.items;
        this.loadTableData(data.items, customCallBack);
      },
      err => {
        if (err.status === 500 || err.status === 404) {
          this._commonService.translateToaster('error', 'ErrorMessage');
        }
      }
    );
  }

  refreshData(apiEndPoint, method, params?: Array<any>) {
    this.manageUrlQuery(method, params);
    this.loadData(apiEndPoint, params).subscribe(
      res => {
        this.page.totalElements = res.total_filtered;
        this.geojsonData = res.items;
        this.loadTableData(res.items, this.customCallBack);
      },
      err => {
        console.log(err);
        if (err.status === 500) {
          this._commonService.translateToaster('error', 'MapList.InvalidTypeError');
        }
      }
    );
  }

  manageUrlQuery(method, params?: Array<any>) {
    // set or append a param to urlQuery
    if (params) {
      if (method === 'set') {
        params.forEach(param => {
          this.urlQuery = this.urlQuery.set(param.param, param.value);
        });
      } else {
        params.forEach(param => {
          this.urlQuery = this.urlQuery.append(param.param, param.value);
        });
      }
    }
  }

  refreshUrlQuery(limit?: number) {
    this.urlQuery = new HttpParams();
    if (limit) {
      this.urlQuery = this.urlQuery.set('limit', limit.toString());
    }
  }

  deleteAndRefresh(apiEndPoint, param) {
    this.urlQuery = this.urlQuery.delete(param);
    this.refreshData(apiEndPoint, 'set');
  }

  toggleStyle(selectedLayer) {
    // togle the style of selected layer
    if (this.selectedLayer !== undefined) {
      this.selectedLayer.setStyle(this.originStyle);
      this.selectedLayer.closePopup();
    }
    this.selectedLayer = selectedLayer;
    this.selectedLayer.setStyle(this.selectedStyle);
  }

  zoomOnSelectedLayer(map, layer) {
    const zoom = map.getZoom();
    // latlng is different between polygons and point
    let latlng;

    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
      latlng = (layer as any)._bounds._northEast;
    } else {
      latlng = layer._latlng;
    }
    if (zoom >= 12) {
      map.setView(latlng, zoom);
    } else {
      map.setView(latlng, 12);
    }
  }

  deFaultCustomColumns(feature) {
    return feature;
  }

  loadTableData(data, customCallBack?) {
    this.tableData = [];
    data.features.forEach(feature => {
      let newFeature = null;
      if (customCallBack) {
        newFeature = customCallBack(feature);
      } else {
        newFeature = this.deFaultCustomColumns(feature);
      }
      this.tableData.push(newFeature.properties);
    });
  }
}

export class Page {
  // The number of elements in the page
  size: number = 5;
  // The total number of elements
  totalElements: number = 0;
  // The total number of pages
  totalPages: number = 2;
  // The current page number
  pageNumber: number = 0;
}
