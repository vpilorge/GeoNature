/**
 * @class application.viewport
 * Singleton to build the viewport (tab)
 *
 * @singleton
 */
application.layout = function() {
    // private variables
    var tabPanel = null;
    // private functions


    /**
     * Method: initViewport
     */
    var initViewport = function() {
        var viewport = new Ext.Viewport({
            layout: 'border'
            ,defaults: {
                border: false
            }
            ,items:[
                getViewportNorthItem()
                ,getViewportSouthItem()
                ,getViewportCenterItem()
            ]
        });
    };

    /**
     * Method: getViewportNorthItem
     */
    var getViewportNorthItem = function() {
        return {
            region: 'north'
            ,el: 'north'
            ,height: 60
            // ,html:"Flore"
            ,cls: "application-header-fs"
        }
    };

    /**
     * Method: getViewportSouthItem
     */
    var getViewportSouthItem = function() {
        return {
            region:"south"
            ,height:25
            ,bbar: new Ext.Toolbar({           
                items: ['&copy; <a href="https://github.com/PnEcrins/GeoNature/" target="_blank">GeoNature</a>, développé par le <a href="http://www.ecrins-parcnational.fr" target="_blank">Parc national des Ecrins</a>', '->',
                application.user.nom+' ('+application.user.status+')',
                {
                    text: 'Déconnexion'
                    ,iconCls: 'logout'
                    ,handler: function() {
                        window.location.href = 'deconnexion';
                    }
                },{
                    text: 'Accueil'
                    ,iconCls: 'home_mini'
                    ,handler: function() {
                        window.location.href = '/'+app_uri;
                    }
                }]
            })
        };
    };

    /**
     * Method: getViewportCenterItem
     */
    var getViewportCenterItem = function() {
        tabPanel = new Ext.TabPanel({
            region: 'center'
            ,xtype:"tabpanel"
            ,activeTab: (application.user.id_station) ? null : 0  
            ,items: [
                application.search.init()
            ]
        });
        return tabPanel;
    };

    // public space
    return {
        tabPanel: null

        ,init: function() {
            initViewport();
            this.tabPanel = tabPanel;

            if (application.user.id_station) {
                this.loadStation({id_station: application.user.id_station});    
            }
        }

        ,loadStation : function(station){
            var id = 'station-' + station.id_station;
            var tab = tabPanel.getComponent(id);
            if(tab){
                tabPanel.setActiveTab(tab);
            }else{
                var p = tabPanel.add(new application.stationPanel({
                    id: id
                    ,station: station
                }));
                tabPanel.setActiveTab(p);
            }
        }

        /**
        * Method: loadStation
        *
        * Shortcut method
        */
        ,loadStationTab: function(id_station) {
          application.layout.loadStation({id_station: id_station});
        }

    }
}();
