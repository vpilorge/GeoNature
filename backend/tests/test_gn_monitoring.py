'''
    Test de l'api gn_media
'''


import os
import requests

from .bootstrap_test import geonature_app
from geonature.core.gn_monitoring.models import TBaseSites
from geonature.core.gn_monitoring.config_manager import generate_config

from geonature.utils.env import DB

class TestAPIMonitoring:

    def test_gn_monitoring_action(self, geonature_app):
        sites = DB.session.query(TBaseSites).all()
        for s in sites:
            print (s.as_dict(recursif=True))
        assert True

    def test_gn_monitoring_route_config(self, geonature_app):
        response = requests.get(
            '{}/gn_monitoring/config?app=chiro&vue=site&vue=list'.format(
                geonature_app.config['API_ENDPOINT']
            )
        )
        if not response.ok:
            assert False
        assert True