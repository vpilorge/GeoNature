from flask import Blueprint, request, current_app

import datetime
import psycopg2
from flask import Blueprint, request, current_app
from sqlalchemy import exc, or_, func, distinct


from geonature.utils.env import DB

from .repositories import ReleveRepository
from .utils import get_nomenclature_filters
from geonature.utils.utilssqlalchemy import (
    json_resp,
    testDataType,
    csv_resp,
    GenericTable,
    serializeQueryTest
)

from geonature.utils import filemanager
from geonature.utils.errors import GeonatureApiError
from geonature.core.users.models import TRoles, UserRigth
from geonature.core.gn_meta.models import TDatasets, CorDatasetsActor
from pypnusershub.db.tools import InsufficientRightsError

from pypnusershub import routes as fnauth

from geojson import FeatureCollection
from shapely.geometry import asShape
from geoalchemy2.shape import from_shape

blueprint = Blueprint('export', __name__)


@blueprint.route('/releves', methods=['GET'])
@fnauth.check_auth_cruved('R', True)
@json_resp
def getReleves(info_role):
    releve_repository = ReleveRepository(TRelevesContact)
    data = releve_repository.get_all(info_role)
    return FeatureCollection([n.get_geofeature() for n in data])


@blueprint.route('/occurrences', methods=['GET'])
@fnauth.check_auth_cruved('R')
@json_resp
def getOccurrences():
    q = DB.session.query(TOccurrencesContact)
    data = q.all()

    return ([n.as_dict() for n in data])

