/**
 * @class application.cflore.editFiche
 * Singleton to build the editFiche viewport
 *
 * @singleton
 */
 
 Ext.namespace("application.cflore");

application.cflore.editFiche = function() {
    // private variables
 
    /**
     * Property: map
     * {OpenLayers.Map}
     */
    map = null;

    /**
     * Property: toolbar
     * {mapfish.widgets.ToolBar}
     */
    var toolbar = null;

    /**
     * Property: toolbarInitializedOnce
     * {Boolean} toolbar has already been initialized
     */
    var toolbarInitializedOnce = false;

    /**
     * Property: vectorLayer
     * {OpenLayers.Layer.Vector}
     */
    vectorLayer = null;

    /**
     * Property: dragPanControl
     */
    var dragPanControl = null;

    /**
     * Property: dragPointControl
     */
    var dragPointControl = null;

    /**
     * Property: store
     * {Ext.data.Store} The ap store (should contain only one record)
     */
    var store = null;

    /**
     * Property: protocol
     * {mapfish.Protocol.MapFish}
     */
    var protocol = null

    /**
     * Property: eventProtocol
     * {mapfish.Protocol.TriggerEventDecorator}
     */
    var eventProtocol = null;

    /**
     * Property: filterProtocol
     * {mapfish.Protocol.MergeFilterDecorator}
     */
    var filterProtocol = null;

    /**
     * Property: format
     * {<OpenLayers.Format.WKT>}
     */
    var format = new OpenLayers.Format.WKT();

    /**
     * APIProperty: id_cflore
     * The id of fiche to update (if applies), null in case of a creating a new fiche
     */
    var id_cflore = null;
    
    /**
     * APIProperty: old_cd_nom
     * The old cd_nom of the taxon to update
     */
    var old_taxon = null;

    /**
     * Property: layerTreeTip
     * {Ext.Tip} The layerTreeTip created with the factory
     */
    var layerTreeTip = null;

    /**
     * Property: firstGeometryLoad
     * {Boolean} is the geometry has been load once only
     */
    var firstGeometryLoad = true;
    
    /**
     * Property: myProxyTaxons
     * {Ext.data.HttpProxy} Url pour charger une liste de taxon fonction de l'unité ???
     */
     
    var myProxyReleves = null;
    
    /**
     * Property: myProxyReleves
     * {Ext.data.HttpProxy} Url pour charger une liste des releves de la fiche ???
     */
     
    var myProxyTaxons = null;
    /**
     * Property: maProjection
     * {Openlayers.Projection} définie ici sinon temps de retard lors de la création du point gps ???
     */
    var maProjection = null; 
    
    /**
     * Property: blankRecord
     * {Ext.data.Record} record vide pour la grid-taxons
     */
    var blankRecord = null;
    
    /**
     * Property: errorMsg
     * {string} message to display if taxon form is invalid or not complete
     */
    var errorMsg = '';
    
    // private functions

    /**
     * Method: initViewport
     */
    var initViewport = function() {
        return new Ext.Viewport({
            layout: 'border'
            ,defaults: {
                border: false
            }
            ,items: [
                getViewportCenterItem()
                ,getViewportEastItem()
                ,getViewportSouthItem()
            ]
            ,listeners: {
                show: initToolbarItems
                ,beforedestroy:function(){window.location.href = host_uri+'/'+app_uri;}
                ,afterlayout: function(){
                    map.baseLayer.redraw();
                }
            }
        });
    };
    /**
     * Method: getViewportSouthItem
     */
    var getViewportSouthItem = function() {
        return {
            region:"south"
            ,layout:'fit'
            ,height:45
            ,bbar: new Ext.Toolbar({           
                items: ['&copy; <a href="https://github.com/PnEcrins/GeoNature/" target="_blank">GeoNature</a>, développé par le <a href="http://www.ecrins-parcnational.fr" target="_blank">Parc national des Ecrins</a>', '->',
                application.cflore.user.nom+' ('+application.cflore.user.status+')',
                {
                    text: 'Déconnexion'
                    ,iconCls: 'logout'
                    ,handler: function() {
                        window.location.href = 'deconnexion' 
                    }
                },{
                    text: 'Accueil'
                    ,iconCls: 'home_mini'
                    ,handler: function() {
                        window.location.href = '/'+app_uri 
                    }
                }]
            })
        }
    };
    /**
     * Method: getViewportEastItem
     */
    var getViewportEastItem = function() {
        return {
            region: 'east'
            ,width: 600
            ,split: true
            ,autoScroll: true
            ,defaults: {
                border: false
            }
            ,items: [{
                id: 'edit-fiche-form'
                ,xtype: 'form'
                ,bodyStyle: 'padding: 5px'
                ,disabled: true
                ,defaults: {
                    xtype: 'numberfield'
                    ,labelWidth: 90
                    ,width: 180
                    ,anchor:'-15'
                }
                ,monitorValid:true
                ,items: [getFormItems(),getFormTaxons()]
                //pour version Extjs 3.4
                ,buttons:[{
                    text: 'Annuler'
                    ,xtype: 'button'
                    ,handler: function() {
                        Ext.Msg.confirm('Attention'
                            ,'Cette action va réinitialiser totalement le formulaire.<br>Si vous avez des données non enregistrées elles seront perdues.<br>Souhaitez poursuivre ?'
                            ,function(btn) {
                                if (btn == 'yes') {
                                    resetViewport();
                                    Ext.ux.Toast.msg('Information !', 'Aucune données n\'a été enregistrée, le formulaire a été réinitialisé.');
                                }
                                else{Ext.ux.Toast.msg('Action annulée', '');}
                            }
                            ,this // scope
                        );   
                    }
                    ,scope: this
                },{
                    text: 'Enregistrer'
                    ,xtype: 'button'
                    ,id: 'ficheSaveButton'
                    ,iconCls: 'action-save'
                    ,handler:function(){submitForm();}
                }]
            }]
        }
    };

    /**
     * Method: getViewportCenterItem
     */
    var getViewportCenterItem = function() {
        createMap();
        toolbar = new mapfish.widgets.toolbar.Toolbar({
            map: map,
            configurable: false
        });

        return {
            region: 'center'
            ,id: 'edit-fiche-mapcomponent'
            ,xtype: 'mapcomponent'
            ,map: map
            ,tbar: toolbar
        };
    };

    /**
     * Method: getFormItems
     * Creates the form items
     */
    var getFormItems = function() { 
        var comboObservateurs = new Ext.ux.form.SuperBoxSelect({
            id:'combo-fiche-observateurs'
            ,xtype:'superboxselect'
            ,fieldLabel: 'Observateur(s) ' 
            ,name: 'lesobservateurs'
            ,store: application.cflore.storeObservateursCfloreAdd
            ,displayField: 'auteur'
            ,valueField: 'id_role'
            ,allowBlank: false
            ,resizable: true
            ,forceSelection : true
            ,selectOnFocus:true
            ,resizable: true
            ,mode: 'local'
            ,value: application.cflore.user.id_utilisateur
            ,listeners:{
                afterrender :function(combo){
                    combo.setValue(application.cflore.user.id_utilisateur);
                    Ext.getCmp('edit-fiche-form').getForm().findField('ids_observateurs').setValue(combo.getValue());
                }
                ,change:function(combo,newValue){
                    Ext.getCmp('edit-fiche-form').getForm().findField('ids_observateurs').setValue(newValue);
                    Ext.getCmp('edit-fiche-form').getForm().findField('ids_observateurs').setValue(newValue);
                }
                ,render: function(c) {
                    Ext.QuickTips.register({
                        target: c.getEl(),
                        text: 'Le ou les auteurs de l\'observation.'
                    });
                }
            }
        });
        var todayButton = new Ext.Button({
            id:'bt-today'
            ,text: 'aujourd\'hui'
            ,handler: function() {
                var d = new Date();
                Ext.getCmp('datefield-fiche-date').setValue(d);
            }
            ,scope: this
        });
        var yesterdayButton = new Ext.Button({
            id:'bt-yesterday'
            ,text: 'hier'
            ,handler: function() {
                var d = new Date();
                d.setDate(d.getDate() - 1);
                Ext.getCmp('datefield-fiche-date').setValue(d);
            }
            ,scope: this
        });
            
        return [{
            id:'hidden-idfiche'
            ,xtype:'hidden'
            ,name: 'id_cflore'   
        },{
            xtype:'hidden'
            ,name: 'monaction'
        },{
            xtype:'hidden'
            ,name: 'id_organisme'
        },{
            xtype: 'hidden'
            ,name: 'geometry' 
        },{
            xtype:'hidden'
            ,name: 'ids_observateurs'
        },{
        // Fieldset 
        xtype:'fieldset'
        ,id:'fieldset-1-fiche'
        ,columnWidth: 1
        ,title: 'Renseignements concernant le pointage'
        ,collapsible: true
        ,autoHeight:true
        ,anchor:'98%'
        ,items :[comboObservateurs
            ,{
                xtype: 'compositefield'
                ,labelWidth: 80
                ,items: [
                {
                    id:'datefield-fiche-date'
                    ,fieldLabel: 'Date '
                    ,name: 'dateobs'
                    ,xtype:'datefield'
                    ,maxValue: new Date()
                    ,format: 'd/m/Y'
                    ,altFormats:'Y-m-d'
                    ,allowBlank: false
                    ,blankText:'La date de l\'observation est obligatoire'
                    ,listeners: {
                        render: function(c) {
                            Ext.QuickTips.register({
                                target: c.getEl(),
                                text: 'Date de l\'observation. Elle ne peut donc être postérieure à la date de saisie.'
                            });
                        }
                    }
                }
                ,todayButton
                ,yesterdayButton
                ,{
                    xtype: 'displayfield',
                    value: '  Altitude :'
                },{
                    id: 'fieldfiche-altitude'
                    ,xtype:'numberfield'
                    ,allowDecimals :false
                    ,allowNegative: false
                    ,name: 'altitude_saisie'
                    ,anchor: '40%'
                    ,listeners: {
                        render: function(c) {
                            Ext.QuickTips.register({
                                target: c.getEl(),
                                text: 'L\'altitude est calculée à partir d\'un service de l\'API Geoportail de l\'IGN. Vous pouvez la corriger si vous le souhaitez.'
                            });
                        }
                    }
                }]
            },{
                id:'fieldlabel-commune'
                ,xtype: 'displayfield'
                ,value: 'Commune : inconnue'
            }
            ]
        } //fin du groupe 1  
        ] //fin du return
    };
    /**
     * Method: getFormTaxons
     *
     * Dans ce formulaire, les données saisies à droite sont enregistrées dans le store
     * de la grille de gauche en temps réel (sur keyup ou sur select pour les combo).
     * Une fonction invoquée sur chaque modification des champs obligatoires vérifie
     * si l'ensemble du formulaire est valid ou non.
     * si oui on active le bouton enregister, sinon l'enregistrement est impossible.
     */
    var getFormTaxons = function(){
        var relevesStoreFields = [
                {name: 'id_releve_cflore', type: 'integer'}
                ,{name: 'id_nom', type: 'integer'}
                ,{name: 'nom_francais', type: 'string',sortType: Ext.data.SortTypes.asAccentuatedString}
                ,{name: 'nom_latin', type: 'string'}
                ,{name: 'nom_taxon_saisi', type: 'string'}
                ,{name: 'id_abondance_cflore', type: 'integer'}
                ,{name: 'id_phenologie_cflore', type: 'integer'}
                ,{name: 'validite_cflore', type: 'boolean'}
                ,{name: 'commentaire', type: 'string'}
                ,{name: 'determinateur', type: 'string'}
                ,{name: 'cd_ref_origine', type: 'integer'}
                ,{name: 'id_classe', type: 'integer'}
                ,{name: 'herbier', type: 'boolean'}
                ,{name: 'patrimonial'}
            ];
            
        myProxyReleves = new Ext.data.HttpProxy({
            id:'store-releve-proxy'
            ,url: 'cflore/listreleves'
            ,method: 'GET'
        });
        var relevesStore = new Ext.data.JsonStore({
            url: myProxyReleves
            ,sortInfo: {
                field: 'nom_francais'
                ,direction: 'ASC'
            }
            ,fields: relevesStoreFields
            ,listeners: {
                load: function(store, records) {
                    Ext.getCmp('grid-taxons').getSelectionModel().selectRow(0);
                }
            }
        });

        //record vide pour le bouton ajouter un taxon
        blankRecord =  Ext.data.Record.create(relevesStoreFields);

        function isPatri(val){
            if(val){
                return '<span style="font-weigt:bold;">' + val + '</span>';
            }
            return val;
        }

        var colModel = new Ext.grid.ColumnModel([
            {header: "Id", width: 55,  sortable: true, dataIndex: 'id_nom',hidden:true}
            ,{id:'taxonfr',header: "Taxons déjà saisis", width: 160, sortable: true, locked:false, dataIndex: 'nom_francais',hidden:true}
            ,{id:'taxonssc',header: "Taxons déjà saisis", width: 160, sortable: true, locked:false, dataIndex: 'nom_latin',hidden:true}
            ,{header: "Abondance", width: 55, sortable: true, dataIndex: 'id_abondance_cflore',hidden:true}
            ,{header: "Phénologie", width: 55, sortable: true, dataIndex: 'id_phenologie_cflore',hidden:true}
            ,{header: "Validité", width: 25, sortable: true, dataIndex: 'validite_cflore',hidden:true}
            ,{header: "Herbier", width: 35, sortable: true, dataIndex: 'herbier',hidden:true}
            ,{header: "Commentaire", width: 135, sortable: true, dataIndex: 'commentaire',hidden:true}
            ,{header: "Déterminateur", width: 50, sortable: true, dataIndex: 'determinateur',hidden:true}
            ,{header: "id_classe", width: 135, sortable: true, dataIndex: 'id_classe',hidden:true}
            ,{id:'taxonsaisi',header: "Taxons saisis", width: 160, sortable: true, dataIndex: 'nom_taxon_saisi'}
            ,{header: "cd_ref", width: 135, sortable: true, dataIndex: 'cd_ref_origine',hidden:true}
            ,{header: "Patrimoniale", width: 50, sortable: true, renderer:isPatri,dataIndex: 'patrimonial',hidden:true}
            ,{
                xtype : 'actioncolumn'
                ,sortable : false
                ,hideable : false
                ,menuDisabled : true
                ,width:20
                ,items : [{
                    tooltip : 'Supprimer ce taxon du pointage'
                    ,getClass : function(v, meta, record, rowIndex, colIdx, store) {
                        return 'action-remove';
                    }
                    ,scope : this
                    ,handler : function(grid, rowIndex, colIndex) {
                        var record = grid.getStore().getAt(rowIndex);
                        if(!record.data.id_nom){
                            grid.getStore().remove(record);
                                if(Ext.getCmp('grid-taxons').getStore().getCount()==0){
                                    this.addNewTaxon();
                                    Ext.ux.Toast.msg('Information !', 'Vous avez supprimé tous les taxons de ce pointage.');
                                }
                                else{
                                    Ext.getCmp('grid-taxons').getSelectionModel().selectRow(0);
                                    Ext.ux.Toast.msg('Annulation !', 'La saisie d\'un nouveau taxon a été annulée.');
                                }
                            }
                            else{
                                Ext.Msg.confirm('Attention'
                                    ,'Etes-vous certain de vouloir supprimer le taxon "'+record.data.nom_francais+'" ?'
                                    ,function(btn) {
                                        if (btn == 'yes') {
                                            grid.getStore().remove(record);
                                            if(Ext.getCmp('grid-taxons').getStore().getCount()==0){
                                                this.addNewTaxon();
                                                Ext.ux.Toast.msg('Suppression !', 'Le taxon "'+record.data.nom_francais+'" a été supprimé de ce pointage. Vous avez supprimé tous les taxons de ce pointage.');
                                            }
                                            else{
                                                Ext.getCmp('grid-taxons').getSelectionModel().selectRow(0);
                                                Ext.ux.Toast.msg('Suppression !', 'Le taxon "'+record.data.nom_francais+'" a été supprimé de ce pointage.');
                                            }
                                        }
                                    }
                                    ,this // scope
                                );
                            }
                            Ext.getCmp('combo-fiche-abondance').setWidth(200);//debug sinon le combo apparait avec une largeur ridicule
                            Ext.getCmp('combo-fiche-abondance').syncSize();//debug sinon le combo apparait avec une largeur ridicule
                    }
                }]
            }
        ]);
        
        var abondancesStore = new Ext.data.JsonStore({
            url: 'bibs/abondancescflore'
            ,sortInfo: {
                field: 'id_abondance_cflore'
                ,direction: 'ASC'
            }
            ,fields: [
                'id_abondance_cflore'
                ,'nom_abondance_cflore'
            ]
            ,autoLoad: true
            ,synchronous: true
            ,listeners: {
                load: function(store, records) {
                    if(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()){
                        Ext.getCmp('combo-fiche-abondance').setValue(Ext.getCmp('grid-taxons').getSelectionModel().getSelected().data.id_abondance_cflore);
                    }
                }
            }
        });
        var phenologiesStore = new Ext.data.JsonStore({
            url: 'bibs/phenologiescflore'
            ,sortInfo: {
                field: 'id_phenologie_cflore'
                ,direction: 'ASC'
            }
            ,fields: [
                'id_phenologie_cflore'
                ,'nom_phenologie_cflore'
            ]
            ,autoLoad: true
            ,synchronous: true
            ,listeners: {
                load: function(store, records) {
                    if(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()){
                        Ext.getCmp('combo-fiche-phenologie').setValue(Ext.getCmp('grid-taxons').getSelectionModel().getSelected().data.id_phenologie_cflore);
                    }
                }
            }
        });

        myProxyTaxons = new Ext.data.HttpProxy({
            id:'store-taxon-proxy'
            ,url: 'bibs/taxonscflore'
            ,method: 'GET'
        });
        var comboTaxonsFiltre = function(){
            var orange = Ext.getCmp('cb-orange-cf').getValue();
            var red = Ext.getCmp('cb-red-cf').getValue();
            var gray = Ext.getCmp('cb-gray-cf').getValue();
            var patri = Ext.getCmp('cb-patri-cf').getValue();

            Ext.getCmp('combo-fiche-taxon').getStore().filterBy(function(record,id){
                var recColor = record.data.couleur;
                var statutPatri = record.data.patrimonial;
                var id_classe = record.data.id_classe;
                if(!patri){
                    if(recColor == 'orange' && orange && comboTaxonsFiltreClasse(id_classe)){return true;}
                    if(recColor == 'red' && red && comboTaxonsFiltreClasse(id_classe)){return true;}
                    if(recColor == 'gray' && gray && comboTaxonsFiltreClasse(id_classe)){return true;}
                }
                if(patri){
                    if(recColor == 'orange' && orange && statutPatri && comboTaxonsFiltreClasse(id_classe)){return true;}
                    if(recColor == 'red' && red && statutPatri && comboTaxonsFiltreClasse(id_classe)){return true;}
                    if(recColor == 'gray' && gray && statutPatri && comboTaxonsFiltreClasse(id_classe)){return true;}
                } 
                return false;
            });
        };
        var comboTaxonsFiltreClasse = function(classe){
            var pteridophytes = Ext.getCmp('cb-pteridophytes-cf').getValue();
            var monocotyledones = Ext.getCmp('cb-monocotyledones-cf').getValue();
            var gymnospermes = Ext.getCmp('cb-gymnospermes-cf').getValue();
            var dicotyledones = Ext.getCmp('cb-dicotyledones-cf').getValue();
            var bryophytes = Ext.getCmp('cb-bryophytes-cf').getValue();
            if((!pteridophytes&&!monocotyledones&&!gymnospermes&&!dicotyledones&&!bryophytes)==true){return true;}
            if(dicotyledones && classe==id_classe_dicotyledones){return true;}
            if(monocotyledones && classe==id_classe_monocotyledones){return true;}
            if(gymnospermes && classe==id_classe_gymnospermes){return true;}
            if(pteridophytes && classe==id_classe_pteridophytes){return true;}
            if(bryophytes && classe==id_classe_bryophytes){
                return true;
            }
            return false;
        };

        /*** SOLUTION ATOL ***/
        var comboTaxonsTemplate = function(langue) {
            var dataIndex = (langue == 'latin'?'nom_latin':'nom_francais');
            var comboFicheTaxon = Ext.getCmp('combo-fiche-taxon');
            comboFicheTaxon.getStore().sort(dataIndex);
            var monTpl = new Ext.XTemplate(
                '<tpl for=".">'+
                '   <div class="x-combo-list-item" style="color:{couleur};">'+
                '       <tpl if="patrimonial">'+
                '           <img src="images/logo_pne.gif" width="10" height="10">'+
                '       </tpl>'+
                '       {'+dataIndex+'}({nb_obs}) - {derniere_date}'+
                '   </div>'+
                '</tpl>');
            if(Ext.isDefined(comboFicheTaxon.view)){
                comboFicheTaxon.view.tpl = monTpl;
                comboFicheTaxon.view.refresh();
            }
        };
        
        var isValidForm = function(){
            var isValid = true;
            Ext.getCmp('grid-taxons').getStore().each(function(r){
                if(r.data.id_nom==0 || r.data.id_nom==null){
                    isValid = false;
                    return false;
                }
                if(r.data.nom_taxon_saisi=='Saisie en cours'){
                    isValid = false;
                    return false;
                }
                if(r.data.id_abondance_cflore==0 || r.data.id_abondance_cflore==null){
                    isValid = false;
                    return false;
                }
                if(r.data.id_phenologie_cflore==0 || r.data.id_phenologie_cflore==null){
                    isValid = false;
                    return false;
                }
                return true;
            });
            return isValid;
        }; 
        var isValidTaxon = function(r){
            var isValid = true;
            errorMsg = '';
            if(r.data.id_nom==0 || r.data.id_nom==null){
                isValid = false;
                errorMsg='Veuillez choisir un taxon';
                return false;
            }
            if(r.data.id_abondance_cflore==0 || r.data.id_abondance_cflore==null){
                isValid = false;
                errorMsg='Veuillez définir l\'abondance pour ce taxon';
                return false;
            }
            if(r.data.id_phenologie_cflore==0 || r.data.id_phenologie_cflore==null){
                isValid = false;
                errorMsg='Veuillez définir la phénologie de ce taxon';
                return false;
            }
            var commentValue = Ext.getCmp('ta-fiche-commentaire').getValue();
            if(Ext.getCmp('cb-herbier').getValue() && (commentValue == null || commentValue == '')){
                isValid = false;
                errorMsg='Un commentaire est obligatoire en cas de mise en herbier';
                return false;
            }
            return isValid;
        };
        var manageValidationTaxon = function(isValid){
            if(isValid){
                Ext.getCmp('grid-taxons').enable();
                Ext.getCmp('bt-validtaxon').enable();
                Ext.getCmp('bt-validtaxon').setIconClass('validate');
                Ext.getCmp('bt-validtaxon').setText('Valider "' + returnTaxonSaisi() +'"');
            }
            else{
                if(!Ext.getCmp('grid-taxons').getSelectionModel().hasNext() && Ext.getCmp('grid-taxons').getSelectionModel().getSelected().data.id_nom==null){
                    Ext.getCmp('grid-taxons').enable();
                }
                else{Ext.getCmp('grid-taxons').disable();}
                Ext.getCmp('bt-validtaxon').disable();
                Ext.getCmp('bt-validtaxon').setIconClass('unvalidate');
                Ext.getCmp('bt-validtaxon').setText('Terminer la saisie pour valider');
                Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_taxon_saisi','Saisie en cours');
            }
            Ext.getCmp('error-message').setText(errorMsg);
            manageValidationForm(isValidForm())
        };
        var manageValidationForm = function(isValid){
            if(isValid){
                Ext.getCmp('ficheSaveButton').enable();
                Ext.getCmp('bt-addtaxon').enable();
            }
            else{
                Ext.getCmp('ficheSaveButton').disable();
                Ext.getCmp('bt-addtaxon').disable();
            }
            
        };

        this.addNewTaxon = function(){
            Ext.getCmp('edit-fiche-form').getForm().findField('monactiontaxon').setValue('add');
            relevesStore.add(new blankRecord({
                //attention l'ordre des champs est important
                id_releve_cflore:null
                ,id_nom:null
                ,nom_francais:''
                ,nom_latin:''
                ,nom_taxon_saisi:'Saisie en cours'
                ,id_abondance_cflore:null
                ,id_phenologie_cflore:null
                ,validite_cflore:default_validite_cflore
                ,commentaire:''
                ,determinateur:''
                ,cd_ref_origine:null
                ,id_classe:null
                ,herbier:false
                ,patrimonial:false
            }));
            Ext.getCmp('fieldset-abondance').collapse();
            Ext.getCmp('fieldset-phenologie').collapse();
            Ext.getCmp('fieldset-validite').collapse();
            Ext.getCmp('fieldset-herbier').collapse();
            Ext.getCmp('fieldset-commentaire').collapse();
            Ext.getCmp('fieldset-determinateur').collapse();
            Ext.getCmp('grid-taxons').getSelectionModel().selectLastRow(false);
            manageValidationTaxon(false); 
        };
        var returnTaxonSaisi = function(){
            var r = null;
            if(Ext.getCmp('combo-fiche-taxon').findRecord('id_nom',Ext.getCmp('combo-fiche-taxon').getValue())){
                r = Ext.getCmp('combo-fiche-taxon').findRecord('id_nom',Ext.getCmp('combo-fiche-taxon').getValue())
            };
            if(Ext.getCmp('radiogroup-langue-cf').getValue().inputValue=='fr'){
                if(r){return r.data.nom_francais;}
                else{return 'en cours';}
            }
            if(Ext.getCmp('radiogroup-langue-cf').getValue().inputValue=='latin'){
                if(r){return r.data.nom_latin;}
                else{return 'en cours';}
            }
        };
             
        if(application.cflore.user.statuscode >= 2){
            var validTaxonButton = new Ext.Button({
                id:'bt-validtaxon'
                ,iconCls: 'unvalidate'
                ,text: 'Terminer la saisie pour valider'
                ,disabled: true
                ,handler: function() {
                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_taxon_saisi',returnTaxonSaisi());
                    manageValidationForm(isValidForm());
                }
                ,scope: this
            });
        }
        if(application.cflore.user.statuscode >= 2){
            var addTaxonButton = new Ext.Button({
                id:'bt-addtaxon'
                ,iconCls: 'add'
                ,text: 'Ajouter un taxon sur ce pointage'
                ,disabled: true
                ,handler: function() {
                    this.addNewTaxon();
                    Ext.getCmp('combo-fiche-taxon').focus();
                }
                ,scope: this
            });
        }
        
        storeTaxonsCf = new Ext.data.JsonStore({
            url: myProxyTaxons
            ,fields: [
                'id_nom'
                ,'cd_ref'
                ,'nom_latin'
                ,{name:'nom_francais',sortType: Ext.data.SortTypes.asAccentuatedString}
                ,'id_classe'
                ,'patrimonial'
                ,'message'
                ,'couleur'
                ,'nb_obs'
                ,'derniere_date'
            ]
            ,sortInfo: {
                field: 'nom_latin'
                ,direction: 'ASC'
            }
            ,autoLoad:true
            ,listeners: {
                load: function(store, records) {
                    if(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()){
                        Ext.getCmp('combo-fiche-taxon').setValue(Ext.getCmp('grid-taxons').getSelectionModel().getSelected().data.id_nom);
                    }
                    comboTaxonsFiltre();
                }
            }
        });
        
        
        /*
         *    création du formulaire taxon
         */
        var gridForm = new Ext.Panel({
            id: 'taxons-form'
            ,frame: true
            ,labelAlign: 'left'
            ,title: 'Listes des taxons observés'
            ,bodyStyle:'padding:5px'
            ,width: 630
            ,layout: 'column'    // Specifies that the items will now be arranged in columns
            ,items: [{
                columnWidth: 0.6
                ,xtype: 'panel'
                ,labelWidth: 80
                ,defaults: {
                    width: 335
                    ,border:false
                    ,allowDecimals :false
                    ,allowNegative: false 
                }    
                ,defaultType: 'numberfield'
                ,autoHeight: true
                ,bodyStyle: Ext.isIE ? 'padding:0 0 5px 5px;' : 'padding:5px 5px;'
                ,border: false
                ,style: {
                    "margin-left": "5px", // when you add custom margin in IE 6...
                    "margin-right": Ext.isIE6 ? (Ext.isStrict ? "-10px" : "-13px") : "0"  // you have to adjust for it somewhere else
                }
                ,items: [
                {
                    xtype:'fieldset'
                    ,id:'fieldset-taxons'
                    ,columnWidth: 1
                    ,title: 'Choix du taxon observé'
                    ,collapsible: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[
                        {
                            id:'radiogroup-langue-cf'
                            ,xtype: 'radiogroup'
                            ,fieldLabel: 'Langue'
                            ,defaultType: 'radio'
                            ,cls:'graytext'
                            ,itemCls:'graytext'
                            ,items: [{
                                    boxLabel: 'français'
                                    ,name: 'langue'
                                    ,itemCls:'graytext'
                                    ,inputValue: 'fr'
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                comboTaxonsTemplate('fr');
                                                Ext.getCmp('combo-fiche-taxon').displayField = 'nom_francais';
                                                Ext.getCmp('combo-fiche-taxon').setValue(Ext.getCmp('combo-fiche-taxon').getValue());//pas trouvé mieux pour rafraichier en live le taxon déjà affiché dans le combo
                                            }
                                            comboTaxonsFiltre();
                                        }
                                    }
                                },{
                                    boxLabel: 'latin'
                                    ,name: 'langue'
                                    ,itemCls:'graytext'
                                    ,inputValue: 'latin'
                                    ,checked: true                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                comboTaxonsTemplate('latin');
                                                Ext.getCmp('combo-fiche-taxon').displayField = 'nom_latin'
                                                Ext.getCmp('combo-fiche-taxon').setValue(Ext.getCmp('combo-fiche-taxon').getValue());//pas trouvé mieux pour rafraichier en live le taxon déjà affiché dans le combo
                                            }
                                            comboTaxonsFiltre();
                                        }
                                    }
                                }
                            ]
                        },{
                            id:'checkboxgroup-classe-cf'
                            ,xtype: 'checkboxgroup'
                            ,fieldLabel: 'Groupe taxonomique'
                            ,cls:'graytext'
                            ,itemCls:'graytext'
                            ,columns: 2
                            // ,vertical:true
                            ,items: [{
                                    id:'cb-monocotyledones-cf'
                                    ,boxLabel: 'Monocotylédones'
                                    ,name: 'cb-monocotyledones'
                                    ,itemCls:'graytext'
                                    ,checked: false                                    
                                    ,listeners: {
                                        check: function(checkbox,checked){
                                            if(checked){
                                                Ext.getCmp('cb-dicotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-gymnospermes-cf').setValue(false);
                                                Ext.getCmp('cb-pteridophytes-cf').setValue(false);
                                                Ext.getCmp('cb-bryophytes-cf').setValue(false);
                                            }
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Affiche les monocotylédones dans la liste si la case est cochée.'
                                            });
                                        }
                                    }                                
                                },{
                                    id:'cb-dicotyledones-cf'
                                    ,boxLabel: 'Dicotylédones'
                                    ,name: 'cb-dicotyledones'
                                    ,itemCls:'graytext'
                                    ,checked: false                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                Ext.getCmp('cb-monocotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-gymnospermes-cf').setValue(false);
                                                Ext.getCmp('cb-pteridophytes-cf').setValue(false);
                                                Ext.getCmp('cb-bryophytes-cf').setValue(false);
                                            }
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Affiche les dicotylédones dans la liste si la case est cochée.'
                                            });
                                        }
                                    }                                
                                },{
                                    id:'cb-gymnospermes-cf'
                                    ,boxLabel: 'Gymnospermes'
                                    ,name: 'cb-gymnospermes'
                                    ,itemCls:'graytext'
                                    ,checked: false                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                Ext.getCmp('cb-monocotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-dicotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-pteridophytes-cf').setValue(false);
                                                Ext.getCmp('cb-bryophytes-cf').setValue(false);
                                            }
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Affiche les gymnospermes dans la liste si la case est cochée.'
                                            });
                                        }
                                    }                                
                                },{
                                    id:'cb-pteridophytes-cf'
                                    ,boxLabel: 'Ptéridophytes'
                                    ,name: 'cb-pteridophytes'
                                    ,itemCls:'graytext'
                                    ,checked: false                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                Ext.getCmp('cb-monocotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-dicotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-gymnospermes-cf').setValue(false);
                                                Ext.getCmp('cb-bryophytes-cf').setValue(false);
                                            }
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Affiche les ptéridophytes dans la liste si la case est cochée.'
                                            });
                                        }
                                    }                                
                                },{
                                    id:'cb-bryophytes-cf'
                                    ,boxLabel: 'Bryophytes'
                                    ,name: 'cb-bryophytes'
                                    ,itemCls:'graytext'                                    
                                    ,checked: false
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(checked){
                                                Ext.getCmp('cb-monocotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-dicotyledones-cf').setValue(false);
                                                Ext.getCmp('cb-gymnospermes-cf').setValue(false);
                                                Ext.getCmp('cb-pteridophytes-cf').setValue(false);
                                            }
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Affiche les bryophytes dans la liste si la case est cochée.'
                                            });
                                        }
                                    }
                                }
                            ]
                        },{
                            id:'checkboxgroup-patri-cf'
                            ,xtype: 'checkboxgroup'
                            ,fieldLabel: 'Patrimonialité'
                            ,itemCls:'graytext'
                            ,items: [{
                                    id:'cb-patri-cf'
                                    ,boxLabel: '<img src="images/logo_pne.gif" width="10" height="10"> Patrimoniaux seulement'
                                    ,name: 'cb-patri'
                                    ,checked: false
                                    ,cls:'graytext'
                                    ,itemCls:'graytext'                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Filtrer la liste avec uniquement les taxons patrimoniaux.'
                                            });
                                        }
                                    }
                                }
                            ]
                        },{
                            id:'checkboxgroup-couleur-cf'
                            ,xtype: 'checkboxgroup'
                            ,fieldLabel: 'A rechercher'
                            ,cls:'graytext'
                            ,itemCls:'graytext'
                            ,items: [{
                                    id:'cb-red-cf'
                                    ,boxLabel: 'Priorité'
                                    ,name: 'cb-red'
                                    ,itemCls:'redtext'                                    
                                    ,checked: true
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Taxons à saisir ou rechercher dans cette unité géographique.'
                                            });
                                        }
                                    }
                                },{
                                    id:'cb-orange-cf'
                                    ,boxLabel: 'Nouveau'
                                    ,name: 'cb-orange'
                                    ,itemCls:'orangetext'
                                    ,checked: true
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'Taxons jamais observés dans dans cette unité géographique.'
                                            });
                                        }
                                    }                                       
                                },{
                                    id:'cb-gray-cf'
                                    ,boxLabel: 'Facultatif'
                                    ,name: 'cb-gray'
                                    ,itemCls:'graytext'
                                    ,checked: true                                    
                                    ,listeners: {
                                        check: function(checkbox,checked) {
                                            if(Ext.getCmp('combo-fiche-taxon')){
                                                Ext.getCmp('combo-fiche-taxon').clearValue();
                                            }
                                            comboTaxonsFiltre();
                                        }
                                        ,render: function(c) {
                                            Ext.QuickTips.register({
                                                target: c.getEl(),
                                                text: 'La saisie est facultative pour ces taxons dans cette unité géographique.'
                                            });
                                        }
                                    }                                
                                }
                            ]
                            ,listeners: {
                                afterrender: function(checkboxg) {
                                    comboTaxonsFiltre();
                                }
                            }
                        },{
                            xtype: 'line'
                        },{
                            id:'combo-fiche-taxon'
                            ,xtype:'twintriggercombo'
                            ,tpl: '<tpl for="."><div class="x-combo-list-item" style="color:{couleur};"> <tpl if="patrimonial"><img src="images/logo_pne.gif" width="10" height="10"></tpl> {nom_latin} ({nb_obs}) - {derniere_date}</div></tpl>'
                            ,fieldLabel: 'Taxon '
                            ,name: 'id_nom'
                            ,hiddenName:"id_nom"
                            ,store: storeTaxonsCf
                            ,valueField: "id_nom"
                            ,displayField: "nom_latin"
                            ,allowBlank:false
                            ,typeAhead: true
                            ,typeAheadDelay:750
                            ,forceSelection: true
                            ,selectOnFocus: true
                            ,editable: true
                            ,resizable:true
                            ,listWidth: 300
                            ,triggerAction: 'all'
                            ,trigger3Class: 'x-form-zoomto-trigger x-hidden'
                            ,mode: 'local'
                            ,listeners: {
                                select: function(combo, record) { 
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_francais',record.data.nom_francais);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_latin',record.data.nom_latin);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_nom',combo.getValue());
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_classe',record.data.id_classe);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('denombrement',record.data.denombrement);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('patrimonial',record.data.patrimonial);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('cd_ref_origine',record.data.cd_ref);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_taxon_saisi','Saisie en cours');
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_abondance_cflore',null);
                                    Ext.getCmp('combo-fiche-abondance').clearValue();
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_phenologie_cflore',null);
                                    Ext.getCmp('combo-fiche-phenologie').clearValue();
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('validite_cflore',default_validite_cflore);
                                    Ext.getCmp('cb-validite').setValue(default_validite_cflore);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('herbier',false);
                                    Ext.getCmp('cb-herbier').setValue(false);
                                    Ext.getCmp('ta-fiche-commentaire').setValue('');
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('commentaire',null);
                                    Ext.getCmp('ta-fiche-determinateur').setValue('');
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('determinateur',null);
                                    manageValidationTaxon(isValidTaxon(record));//puisque le critère est obligatoire et qu'on vient de le vider
                                    Ext.getCmp('fieldset-abondance').expand();
                                    Ext.getCmp('combo-fiche-abondance').setWidth(200);//debug sinon le combo apparait avec une largeur ridicule
                                    Ext.getCmp('combo-fiche-abondance').syncSize();//debug sinon le combo apparait avec une largeur ridicule
                                }
                                ,change: function(combo, record) {
                                    Ext.getCmp('combo-fiche-abondance').clearValue();
                                    if(record.data){
                                        manageValidationTaxon(isValidTaxon(record));
                                    }
                                }
                                ,afterrender: function(combo, record) {
                                    comboTaxonsFiltre();
                                    combo.keyNav.tab = function() { // Override TAB handling function
                                        this.onViewClick(false); // Select the currently highlighted row
                                    };
                                }
                                ,clear: function(combo, record) {
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_francais',null);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_latin',null);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_nom',null);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_classe',null);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('patrimonial',false);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('cd_ref_origine',null);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('nom_taxon_saisi','Saisie en cours');
                                    Ext.getCmp('combo-fiche-abondance').clearValue();
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_abondance_cflore',null);
                                    Ext.getCmp('combo-fiche-phenologie').clearValue();
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_phenologie_cflore',null);
                                    Ext.getCmp('cb-validite').setValue(default_validite_cflore);
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('validite_cflore',default_validite_cflore); 
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('herbier',false);
                                    Ext.getCmp('cb-herbier').setValue(false);
                                    Ext.getCmp('ta-fiche-commentaire').setValue('');
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('commentaire',null);
                                    Ext.getCmp('ta-fiche-determinateur').setValue('');
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('determinateur',null);
                                    Ext.getCmp('fieldset-abondance').collapse();
                                    Ext.getCmp('fieldset-phenologie').collapse();
                                    Ext.getCmp('fieldset-validite').collapse();
                                    Ext.getCmp('fieldset-herbier').collapse();
                                    Ext.getCmp('fieldset-commentaire').collapse();
                                    Ext.getCmp('fieldset-determinateur').collapse();
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                            }
                        }
                    ]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-abondance'
                    ,columnWidth: 1
                    ,title: 'Définir l\'abondance'
                    ,collapsible: true
                    ,collapsed: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[
                        {
                            id:'combo-fiche-abondance'
                            ,xtype:'twintriggercombo'
                            ,fieldLabel: 'Abondance '
                            ,name: 'id_abondance_cflore'
                            ,hiddenName:"id_abondance_cflore"
                            ,store: abondancesStore
                            ,valueField: "id_abondance_cflore"
                            ,displayField: "nom_abondance_cflore"
                            ,allowBlank:false
                            ,typeAhead: true
                            ,forceSelection: true
                            ,selectOnFocus: true
                            ,editable: true
                            ,resizable:true
                            ,listWidth: 300
                            ,typeAheadDelay:750
                            ,triggerAction: 'all'
                            ,trigger3Class: 'x-form-zoomto-trigger x-hidden'
                            ,mode: 'local'
                            ,listeners: {
                                select: function(combo, record) {
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_abondance_cflore',combo.getValue());
                                    Ext.getCmp('fieldset-phenologie').expand();
                                    Ext.getCmp('combo-fiche-phenologie').setWidth(200);//debug sinon le combo apparait avec une largeur ridicule
                                    Ext.getCmp('combo-fiche-phenologie').syncSize();//debug sinon le combo apparait avec une largeur ridicule
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,change: function(combo, record) {
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,clear: function(combo, record) {
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,afterrender: function(combo, record) {
                                    combo.keyNav.tab = function() { // Override TAB handling function
                                        this.onViewClick(false); // Select the currently highlighted row
                                    };
                                }
                            }
                        }
                    ]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-phenologie'
                    ,columnWidth: 1
                    ,title: 'Définir la phénologie'
                    ,collapsible: true
                    ,collapsed: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[
                        {
                            id:'combo-fiche-phenologie'
                            ,xtype:'twintriggercombo'
                            ,fieldLabel: 'Phénologie '
                            ,name: 'id_phenologie_cflore'
                            ,hiddenName:"id_phenologie_cflore"
                            ,store: phenologiesStore
                            ,valueField: "id_phenologie_cflore"
                            ,displayField: "nom_phenologie_cflore"
                            ,allowBlank:false
                            ,typeAhead: true
                            ,forceSelection: true
                            ,selectOnFocus: true
                            ,editable: true
                            ,resizable:true
                            ,listWidth: 300
                            ,typeAheadDelay:750
                            ,triggerAction: 'all'
                            ,trigger3Class: 'x-form-zoomto-trigger x-hidden'
                            ,mode: 'local'
                            ,listeners: {
                                select: function(combo, record) {
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('id_phenologie_cflore',combo.getValue());
                                    Ext.getCmp('fieldset-validite').expand();
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,change: function(combo, record) {
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,clear: function(combo, record) {
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,afterrender: function(combo, record) {
                                    combo.keyNav.tab = function() { // Override TAB handling function
                                        this.onViewClick(false); // Select the currently highlighted row
                                    };
                                }
                            }
                        }
                    ]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-validite'
                    ,columnWidth: 1
                    ,title: 'Définir la validité'
                    ,collapsible: true
                    ,collapsed: true
                    ,hidden:!(application.cflore.user.statuscode >= 5 && use_validite_cflore)
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[
                        {
                            id:'cb-validite'
                            ,xtype:'checkbox'
                            ,fieldLabel: label_validite
                            ,name: 'validite_cflore'
                            ,inputValue: true
                            ,checked: false                                   
                            ,listeners: {
                                check: function(checkbox,checked) {
                                    if(checked){
                                        Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('validite_cflore',true);
                                    }
                                    else{
                                        Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('validite_cflore',false);
                                    }
                                    Ext.getCmp('fieldset-herbier').expand();
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                                ,render: function(c) {
                                    Ext.QuickTips.register({
                                        target: c.getEl(),
                                        text: tooltip_validite
                                    });
                                }
                            }                                
                        }
                    ]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-herbier'
                    ,columnWidth: 1
                    ,title: 'Mise en herbier'
                    ,collapsible: true
                    ,collapsed: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[{
                        id:'cb-herbier'
                        ,xtype:'checkbox'
                        ,fieldLabel: 'Mise en herbier'
                        ,name: 'herbier'
                        ,inputValue: true
                        ,checked: false                                   
                        ,listeners: {
                            check: function(checkbox,checked) {
                                if(checked){
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('herbier',true);
                                    var commentValue = Ext.getCmp('ta-fiche-commentaire').getValue();
                                    if(commentValue == null || commentValue == ''){
                                        Ext.getCmp('ta-fiche-commentaire').markInvalid('En cas de mise en herbier, un commentaire est obligatoire.');
                                    }
                                }
                                else{
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('herbier',false);
                                    Ext.getCmp('ta-fiche-commentaire').validate();
                                }
                                Ext.getCmp('fieldset-commentaire').expand();
                                manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                            }
                            ,render: function(c) {
                                Ext.QuickTips.register({
                                    target: c.getEl(),
                                    text: 'Cochez si vous avez prélevé la plante ou une partie de la plante pour mise en herbier.'
                                });
                            }
                        }                                
                    }]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-commentaire'
                    ,columnWidth: 1
                    ,title: 'Commentaire concernant le taxon (facultatif)'
                    ,collapsible: true
                    ,collapsed: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[{
                            id:'ta-fiche-commentaire'
                            ,xtype: 'textarea'
                            ,fieldLabel: 'Commentaire '
                            ,name: 'commentaire'
                            ,grow:true
                            ,autoHeight: true
                            ,height:'auto'
                            ,anchor:'100%'
                            ,enableKeyEvents:true
                            ,listeners: {
                                render: function(c) {
                                    Ext.QuickTips.register({
                                        target: c.getEl(),
                                        text: 'Indiquer ici un éventuel commentaire concernant ce taxon.'
                                    });
                                }
                                ,keyup: function(field) {
                                    Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('commentaire',field.getValue());
                                    manageValidationTaxon(isValidTaxon(Ext.getCmp('grid-taxons').getSelectionModel().getSelected()));
                                }
                            }
                        }
                    ]
                },{
                    xtype:'fieldset'
                    ,id:'fieldset-determinateur'
                    ,columnWidth: 1
                    ,title: 'Déterminateur du taxon (facultatif)'
                    ,collapsible: true
                    ,collapsed: true
                    ,autoHeight:true
                    ,anchor:'100%'
                    ,items :[{
                            id:'ta-fiche-determinateur'
                            ,xtype: 'textarea'
                            ,fieldLabel: 'Déterminateur '
                            ,name: 'determinateur'
                            ,grow:true
                            ,autoHeight: true
                            ,height:'auto'
                            ,anchor:'100%'
                            ,enableKeyEvents:true
                            ,listeners: {
                                render: function(c) {
                                    Ext.QuickTips.register({
                                        target: c.getEl(),
                                        text: 'Indiquer ici le determinateur de ce taxon.'
                                    });
                                }
                                ,keyup: function(field) {Ext.getCmp('grid-taxons').getSelectionModel().getSelected().set('determinateur',field.getValue());}
                            }
                        }
                    ]
                }
                ,validTaxonButton
                ,{xtype: 'label',id: 'error-message',cls: 'errormsg',text:''}
                ,addTaxonButton 
                ,{
                    xtype:'hidden'
                    ,name: 'monactiontaxon'
                    ,value:'update'
                },{
                    xtype:'hidden'
                    ,name: 'cd_ref_origine'
                },{
                    xtype:'hidden'
                    ,name: 'nom_taxon_saisi'
                }
                ]
            },{
                columnWidth: 0.4
                ,layout: 'fit'
                ,items:[{
                    xtype: 'grid'
                    ,id:'grid-taxons'
                    ,store: relevesStore
                    ,cm: colModel
                    ,stripeRows: true
                    ,sm: new Ext.grid.RowSelectionModel({
                        singleSelect: true
                        ,listeners: {
                            rowselect: function(sm, row, rec) {
                                Ext.getCmp('edit-fiche-form').getForm().loadRecord(rec);
                                if(rec.data.nom_taxon_saisi=='Saisie en cours'){
                                    if(Ext.getCmp('combo-fiche-taxon').getValue()==null){
                                        Ext.getCmp('fieldset-abondance').collapse();
                                        Ext.getCmp('fieldset-phenologie').collapse();
                                        Ext.getCmp('fieldset-validite').collapse();
                                        Ext.getCmp('fieldset-herbier').collapse();
                                        Ext.getCmp('fieldset-commentaire').collapse();
                                        Ext.getCmp('fieldset-determinateur').collapse();
                                    }
                                    else{Ext.getCmp('fieldset-abondance').expand();}
                                    if(Ext.getCmp('combo-fiche-abondance').getValue()==null){
                                        Ext.getCmp('fieldset-phenologie').collapse();
                                        Ext.getCmp('fieldset-validite').collapse();
                                        Ext.getCmp('fieldset-herbier').collapse();
                                        Ext.getCmp('fieldset-commentaire').collapse();
                                        Ext.getCmp('fieldset-determinateur').collapse();
                                    }
                                    else{
                                        Ext.getCmp('fieldset-phenologie').expand();
                                        Ext.getCmp('fieldset-validite').expand();
                                        if(Ext.getCmp('cb-herbier').getValue()==false){Ext.getCmp('fieldset-herbier').collapse();}
                                        else{Ext.getCmp('fieldset-herbier').expand();}
                                        if(Ext.getCmp('ta-fiche-commentaire').getValue()==''){Ext.getCmp('fieldset-commentaire').collapse();}
                                        else{Ext.getCmp('fieldset-commentaire').expand();}
                                        if(Ext.getCmp('ta-fiche-determinateur').getValue()==''){Ext.getCmp('fieldset-determinateur').collapse();}
                                        else{Ext.getCmp('fieldset-determinateur').expand();}
                                    }
                                }
                                else{
                                    Ext.getCmp('fieldset-abondance').expand();
                                    Ext.getCmp('fieldset-phenologie').expand();
                                    Ext.getCmp('fieldset-validite').expand();
                                    if(Ext.getCmp('cb-herbier').getValue()==false){Ext.getCmp('fieldset-herbier').collapse();}
                                    else{Ext.getCmp('fieldset-herbier').expand();}
                                    if(Ext.getCmp('ta-fiche-commentaire').getValue()==''){Ext.getCmp('fieldset-commentaire').collapse();}
                                    else{Ext.getCmp('fieldset-commentaire').expand();}
                                    if(Ext.getCmp('ta-fiche-determinateur').getValue()==''){Ext.getCmp('fieldset-determinateur').collapse();}
                                    else{Ext.getCmp('fieldset-determinateur').expand();}
                                }
                            }
                            ,selectionchange: function(sm) {
                                if(Ext.getCmp('edit-fiche-form').getForm().findField('monactiontaxon').getValue()=='add'){
                                    Ext.getCmp('edit-fiche-form').getForm().findField('monactiontaxon').setValue('update');
                                }
                                if(sm.getSelected()){
                                    manageValidationTaxon(isValidTaxon(sm.getSelected()));
                                }
                            } 
                        }
                    })
                    ,viewConfig: {
                        // Return CSS class to apply to rows depending upon data values
                        getRowClass: function(r, index) {
                            var patri = r.get('patrimonial');
                            if(patri){
                                return 'gras';
                            }
                        }
                    }
                    ,autoExpandColumn: 'taxonsaisi'
                    ,height: 350
                    ,border: true
                    ,listeners: {
                        viewready: function(g) {
                            g.getSelectionModel().selectRow(0);
                        } // Allow rows to be rendered.
                    }
                }
                ]
            }//fin du collum2 
            ]//fin du item
            ,listeners: {
                afterlayout: function(g) {
                    Ext.getCmp('grid-taxons').getSelectionModel().selectRow(0);
                }
            }
        });//fin du gridForm
        return [gridForm];
    };//Fin du getFormTaxons
    
    /**
     * Method: createLayer
     * Creates the vector layer
     *
     * Return
     * <OpenLayers.Layer.Vector>
     */
    var createLayer = function() {
        var styleMap = new OpenLayers.StyleMap({
            'default': {
                fillColor: "red"
                ,strokeColor: "#ff6666"
                ,cursor: "pointer"
                ,fillOpacity: 0.7
                ,strokeOpacity: 1
                ,strokeWidth: 2
                ,pointRadius: 7
            }
            ,select : {
                fillColor: "blue"
                ,strokeColor: "blue"
                ,cursor: "pointer"
                ,fillOpacity: 0.5
                ,strokeOpacity: 1
                ,strokeWidth: 3
                ,pointRadius: 8
            }
        });
        vectorLayer = new OpenLayers.Layer.Vector("editFiche vector layer"
            ,{
                protocol: eventProtocol
                ,strategies: [
                    new mapfish.Strategy.ProtocolListener()
                ]
                ,styleMap: styleMap
                ,format: OpenLayers.Format.GeoJSON
            }
        );
        vectorLayer.events.on({
            featureadded: function(obj) {
                var feature = obj.feature;
                if(map.getZoom()<15){
                    vectorLayer.removeFeatures(feature);
                    zoomin.activate();// on active le bouton pour zoomer
                    Ext.ux.Toast.msg('Echelle de saisie inadaptée', 'Vous ne pouvez pas pointer à cette échelle. <br />Merci de zoomer jusqu\'à la carte au 1/25 000ème.');
                    return false; //la fonction s'arrête là
                }
                if(vectorLayer.features[1]){
                    vectorLayer.removeFeatures(vectorLayer.features[0]);//s'il y a déjà une géométrie, on la supprime pour ne garder que celle qui vient d'être ajoutée
                }
                updateGeometryField(feature);
                Ext.getCmp('edit-fiche-form').enable();
                Ext.getCmp('edit-fiche-form').ownerCt.ownerCt.doLayout();
                Ext.getCmp('edit-fiche-form').getForm().findField('ids_observateurs').setValue(Ext.getCmp('combo-fiche-observateurs').getValue());
                myProxyTaxons.url = 'bibs/taxonscfloreu?point='+Ext.getCmp('edit-fiche-form').getForm().findField('geometry').getValue();
                Ext.getCmp('combo-fiche-taxon').getStore().reload();
                application.cflore.editFiche.findZ(feature);
            }
            ,featuremodified: function(obj) {
                updateGeometryField(obj.feature);
                myProxyTaxons.url = 'bibs/taxonscfloreu?point='+Ext.getCmp('edit-fiche-form').getForm().findField('geometry').getValue();
                Ext.getCmp('combo-fiche-taxon').getStore().reload();
            }
            ,featureremoved: function(obj) {
                updateGeometryField(null);
                Ext.getCmp('edit-fiche-form').disable();
            }
        });
    };

    /**
     * Method: createMap
     * Creates the map
     *
     * Return
     * <OpenLayers.Map>
     */
    var createMap = function() {
        map = application.cflore.createMap();
        map.getLayersByName('overlay')[0].mergeNewParams({
          id_cflore:id_cflore
        });
        createLayer();
        map.addLayers([vectorLayer]);
        map.zoomToMaxExtent();
        maProjection = map.getProjectionObject();
    };

    /**
     * Method: initToolbarItems
     * Creates the map toolbar
     */
    var initToolbarItems = function() {
        if (!toolbarInitializedOnce) {
            toolbar.addControl(
                new OpenLayers.Control.ZoomToMaxExtent({
                    map: map,
                    title: 'Revenir à l\'échelle maximale'
                }), {
                    iconCls: 'zoomfull',
                    toggleGroup: this.id
                }
            );

            application.cflore.utils.addSeparator(toolbar);
            
            var history = new OpenLayers.Control.NavigationHistory();
            map.addControl(history);
            toolbar.addControl(history.previous, {
                iconCls: 'previous'
                ,toggleGroup: 'navigation'
                ,tooltip: 'Etendue précédente'
                ,handler: function() {
                    syntheseListGrid.getView().refresh();
                }
            });
            
            toolbar.addControl(
                zoomin = new OpenLayers.Control.ZoomBox({
                    title: 'Zoomer'
                }), {
                    iconCls: 'zoomin',
                    toggleGroup: this.id
                }
            );

            toolbar.addControl(
                new OpenLayers.Control.ZoomBox({
                    out: true,
                    title: 'Dézoomer'
                }), {
                    iconCls: 'zoomout',
                    toggleGroup: this.id
                }
            );

            toolbar.addControl(
                dragPanControl = new OpenLayers.Control.DragPan({
                    isDefault: true,
                    title: 'Déplacer la carte'
                }), {
                    iconCls: 'pan',
                    toggleGroup: this.id
                }
            );

            application.cflore.utils.addSeparator(toolbar);

            toolbar.addControl(
                drawPointControl = new OpenLayers.Control.DrawFeature(vectorLayer, OpenLayers.Handler.Point, {
                    title: 'Localiser l\'observation (supprime la localisation existante s\'il y en a une)'
                }), {
                    iconCls: 'drawpoint'
                    ,toggleGroup: this.id
                    ,disabled: true
                }
            );
            
            toolbar.add({
                text: 'GPS'
                ,id: 'edit-fiche-gps'
                ,tooltip: 'Positionner l\'observation sur la carte à partir de coordonnées GPS en UTM'
                ,handler: function() {
                    vectorLayer.removeFeatures(vectorLayer.features[0]);
                    application.cflore.editFiche.initGpsWindow();
                }
            });
            
            layerTreeTip = application.cflore.createLayerWindow(map);
            layerTreeTip.render(Ext.getCmp('edit-fiche-mapcomponent').body);
            layerTreeTip.show();
            layerTreeTip.getEl().alignTo(
                Ext.getCmp('edit-fiche-mapcomponent').body,
                "tl-tl",
                [5, 5]
            );
            layerTreeTip.hide();

            application.cflore.utils.addSeparator(toolbar);

            toolbar.add({
                iconCls: 'legend'
                ,enableToggle: true
                ,tooltip: 'Gérer les couches affichées'
                ,handler: function(button) {
                    showLayerTreeTip(button.pressed);
                }
            });

            toolbar.activate();
            toolbarInitializedOnce = true;
        }
    };

    /**
     * Method: activateControls
     * Allows to activate / enable / deactivate / disable the draw and modify feature controls
     *
     * Parameters:
     * activateDrawControls - {Boolean} true to activate / enable the draw controls
     */
    var activateControls = function(activateDrawControls) {
        Ext.each([drawPointControl]
            ,function(control) {
                toolbar.getButtonForControl(control).setDisabled(!activateDrawControls);
                if (!activateDrawControls) {
                    control.deactivate();
                }
            }
        );
    };

    /**
     * Method: deactivateAllEditingControls
     */
    var deactivateAllEditingControls = function() {
        toolbar.getButtonForControl(drawPointControl).setDisabled(true);
        drawPointControl.deactivate();
    };

    /**
     * Method: updateGeometryField
     * Updates the geometry field (hidden) in the form
     *
     * Parameters:
     * geometry - {null|<OpenLayers.Geometry>} Geometry
     */
    var updateGeometryField = function(geometry) {
        if (geometry == null) {
            wkt = '';
        }
        else {
            var wkt = format.write(geometry);
        }
        Ext.getCmp('edit-fiche-form').getForm().findField('geometry').setValue(wkt);
        firstGeometryLoad = false;
    };
    
    /**
     * Method: createProtocol
     * Create the search protocol.
     */
    var createProtocol = function() {
        protocol = new mapfish.Protocol.MapFish({});
        eventProtocol = new mapfish.Protocol.TriggerEventDecorator({
            protocol: protocol
            ,eventListeners: {
                crudtriggered: function() {
                }
                ,crudfinished: function(response) {
                    var feature = response.features[0]; 
                    //chargement des valeurs du formulaire
                    Ext.getCmp('edit-fiche-form').getForm().loadRecord(feature);
                    //on centre en limitant le zoom à 15
                    var centerGeom = feature.geometry.getBounds().getCenterLonLat();
                    map.setCenter(centerGeom,15);
                    Ext.getCmp('edit-fiche-form').enable();
                }
            }
        });
    };

    /**
     * Method: createStore
     * Create the search result store.
     */
    var createStore = function() {
        store = new Ext.data.Store({
            reader: new mapfish.widgets.data.FeatureReader({}, [
                'id_cflore'
                ,'ids_observateurs'
                ,{name:'dateobs', type: 'date', dateFormat:'d/m/Y'}
                ,'commune'
                ,'altitude'
            ])
            ,listeners: {
                load: function(store, records) {
                    Ext.getCmp('edit-fiche-form').getForm().loadRecord(records[0]);
                }
            }
        });
    };

    /**
     * Method: resetViewport
     * Reset the different items status (on close) for next usage
     */
    var resetViewport = function() {
        id_cflore = null;
        vectorLayer.removeFeatures(vectorLayer.features);
        Ext.getCmp('edit-fiche-form').getForm().reset();
        Ext.getCmp('edit-fiche-form').getForm().findField('monaction').setValue('add');
        Ext.getCmp('edit-fiche-form').getForm().findField('id_organisme').setValue(application.cflore.user.id_organisme);
        Ext.getCmp('grid-taxons').getStore().removeAll();
        this.addNewTaxon();
        dragPanControl.activate();
        activateControls(true);
        updateGeometryField(null);
        Ext.getCmp('edit-fiche-form').disable();        
    };
    
     /**
     * Method: constructStringTaxons
     * Construct a multidimentional Array with all taxon informations
     */
    var constructStringTaxons = function(){     
        var arrayGlobal = []
        Ext.getCmp('grid-taxons').getStore().each(function(rec){
            var attrib = [];
            var reg = new RegExp("(,)", "g");
            var val = null;
            for (key in rec.data) {
                if(typeof rec.data[key]==="string"){
                    val = rec.data[key].replace(reg,'<!>');//gestion des virgules dans les commentaires
                } 
                else{
                    val = rec.data[key];
                }
                attrib.push(val);
            }
            arrayGlobal.push(attrib);
        });     
        var taxons = arrayGlobal.join("|")
        return taxons;
    };

    /**
     * Method: submitForm
     * Submits the form
     */
    var submitForm = function() {
        Ext.getCmp('ficheSaveButton').setText('Enregistrement en cours...');
        var params = {};
        if (id_cflore) {
            params.id_cflore = id_cflore;
        }
        params.sting_taxons = constructStringTaxons();
        Ext.getCmp('edit-fiche-form').getForm().submit({
            url: 'cflore/save'
            ,params: params
            ,success: function(form,action) {
                Ext.getCmp('ficheSaveButton').setText('Enregistrer');
                Ext.getCmp('edit-fiche-form').getForm().findField('id_cflore').setValue(action.result.id_cflore);
                id_cflore = action.result.id_cflore;
                Ext.getCmp('edit-fiche-form').getForm().findField('monaction').setValue('update');
                myProxyReleves.url = 'cflore/listreleves/'+id_cflore;
                Ext.getCmp('grid-taxons').getStore().reload();
                application.cflore.editFiche.initSaveWindow(id_cflore);
            }
            ,failure: function(form, action) {
                Ext.getCmp('ficheSaveButton').setText('Enregistrer');
                var msg;
                switch (action.failureType) {
                      case Ext.form.Action.CLIENT_INVALID:
                          msg = "Les informations saisies sont invalides ou incomplètes. Vérifiez le formulaire (voir champs en rouge).";
                          break;
                      case Ext.form.Action.CONNECT_FAILURE:
                          msg = "Erreur lors de l'enregistrement";
                          break;
                      case Ext.form.Action.SERVER_INVALID:
                          msg = "Erreur lors de l'enregistrement : vérifiez les données saisies !";
                          break;
                }
                Ext.Msg.show({
                  title: 'Erreur'
                  ,msg: msg
                  ,buttons: Ext.Msg.OK
                  ,icon: Ext.MessageBox.ERROR
                });
            }
        });
    };

    /**
     * Method: showLayerTreeTip
     * Shows or hide the layer tree tip
     */
    var showLayerTreeTip = function(show) {
        layerTreeTip.setVisible(show);
    };
    

    var initSaveWindow = function(id_fiche) {     
        return new Ext.Window({
            id:'window-save'
            ,title:'POINTAGE N° <span style="color:red;fontWeight:bold;">'+id_fiche+'</span>. Et maintenant chef, on fait quoi chef ?'
            ,layout:'border'
            ,height:175
            ,width: 600
            ,closable:false
            ,autoScroll:true
            ,modal: true
            ,plain: true
            ,split: true
            ,buttons: [{
                text: 'Créer un nouveau pointage'
                ,iconCls:'add'
                ,handler: function(){
                    resetViewport();
                    Ext.getCmp('window-save').destroy();
                    Ext.ux.Toast.msg('Et voilà !', 'C\'est reparti ! Pensez à commencer par le pointage sur la carte');
                }
            },{
                text: 'Modifier/compléter ce pointage'
                ,iconCls:'annuler'
                ,handler: function(){
                    Ext.ux.Toast.msg('Ok !', 'Vous pouvez compléter ou modifier ce pointage');
                    Ext.getCmp('window-save').destroy();
                }
            },{
                text:'Accéder à la synthèse'
                ,iconCls:'search'
                ,handler: function(){
                    window.location.href = 'synthese';
                }
            },{
                text:'Quitter'
                ,iconCls:'action-recenter'
                ,handler: function(){
                    Ext.getCmp('window-save').destroy();
                    window.location.href = 'http://'+host_uri+'/'+app_uri;
                }
            }]
            ,items: [{
                id:'panel-window-save'
                ,xtype: 'panel'
                ,region: 'center'
                ,frame:true
                ,border:false
                ,split: false
                ,autoScroll:false
                ,bodyStyle:'padding:5px 5px 0'
                ,width: 350
                ,html: 'Votre pointage a bien été enregistré sous le N° <span style="color:red;fontWeight:bold;">'+id_fiche+'</span>. </br>A l\'avenir, pour le consulter ou éventuellement le modifier, vous devrez utiliser l\'application synthèse.</br></br>Vous pouvez maintenant utiliser l\'un des boutons ci-dessous pour modifier ou compléter ce pointage n°'+id_fiche+', réaliser un autre pointage, accéder à l\'application de synthèse ou quitter.'
            }]
            ,listeners: {
                hide:function(){this.destroy();}
            } 
        });
    };
//---------------------------------- fin de fenêtre choix après sauvegarde ----------------------------------
    // public space
    return {
        viewport: null
        ,init: function() {
            createProtocol();
            createStore();
            this.viewport = initViewport();
        }
        
        /**
         * Method: loadAp
         * Loads a record from the aps list store
         */
        ,loadFiche: function(fiche,action,cd) {
            this.init();
            this.viewport.show();
                activateControls(true);
                updateGeometryField(null);
                Ext.getCmp('edit-fiche-form').getForm().findField('monaction').setValue('add');
                Ext.getCmp('edit-fiche-form').getForm().findField('id_organisme').setValue(application.cflore.user.id_organisme);
                Ext.getCmp('edit-fiche-form').getForm().findField('monactiontaxon').setValue('add');
                Ext.getCmp('grid-taxons').getStore().removeAll();
                Ext.getCmp('grid-taxons').getStore().add(new blankRecord({
                    //attention l'ordre des champs est important
                    id_releve_cflore:null
                    ,id_nom:null
                    ,nom_francais:''
                    ,nom_latin:''
                    ,nom_taxon_saisi:'Saisie en cours'
                    ,id_abondance_cflore:null
                    ,id_phenologie_cflore:null
                    ,validite_cflore:default_validite_cflore
                    ,commentaire:''
                    ,determinateur:''
                    ,cd_ref_origine:null
                    ,id_classe:null
                    ,herbier:false
                    ,patrimonial:false
                }));
                Ext.getCmp('grid-taxons').getSelectionModel().selectRow(0);
                Ext.ux.Toast.msg('Information !', 'Commencez par pointer l\'observation sur la carte, puis saisissez les informations à droite');
        }

        ,initGpsWindow: function() {
            this.GpsWindow = Ext.ux.GpsLocation.initGpsWindow(vectorLayer);
            this.GpsWindow.show();
        }
        ,initSaveWindow: function(id_fiche) {
            this.saveWindow = initSaveWindow(id_fiche);
            this.saveWindow.show();
        }
        
        //remplir l'altitude du champ altitude dans le formulaire selon le pointage
        ,findZ : function(feature) {
            //on recherche l'altitude avec l'API IGN
            var geometryCentroid = feature.geometry.getCentroid();
            var latLonGeom = geometryCentroid.transform(new OpenLayers.Projection("EPSG:3857"), new OpenLayers.Projection("EPSG:4326"));
            var script = document.createElement('script');
            script.src = String.format('//wxs.ign.fr/{0}/alti/rest/elevation.xml?lon={1}&lat={2}&output=json&zonly=true&callback=application.cflore.editFiche.handleIGNResponse', ign_api_key, latLonGeom.x, latLonGeom.y);
            document.head.appendChild(script);
        }
        ,handleIGNResponse : function(data) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(data.xml, "text/xml");
            var s = xmlDoc.getElementsByTagName('z');
            if (s.length === 0 || Ext.isEmpty(s[0]) || Ext.isEmpty(s[0].innerHTML)) {
                Ext.Msg.alert('Attention', "Un problème à été rencontré lors de l'appel au service de l'IGN.");
                return;
            }
            Ext.ux.Toast.msg('Information !', 'Cette altitude est fournie par un service de l\'IGN.');
            application.cflore.editFiche.setAltitude(Math.round(s[0].innerHTML));
        }
        ,setAltitude : function(alti) {
            Ext.getCmp('fieldfiche-altitude').setValue(alti);
        }
        
        ,changeLabel: function(fieldId, newLabel){
              var label = Ext.DomQuery.select(String.format('label[for="{0}"]', fieldId));
              if (label){
                label[0].childNodes[0].nodeValue = newLabel;
              }
        }
    }
}();
