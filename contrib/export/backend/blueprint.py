import os
import datetime
import psycopg2
from flask import Blueprint, request, current_app, send_from_directory
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
from pypnusershub.db.tools import InsufficientRightsError
from pypnusershub import routes as fnauth


blueprint = Blueprint('export', __name__)


@blueprint.route('/exports/<path:export>')
# @fnauth.check_auth_cruved('R')
# @json_resp
def getExport(export):
    try:
        return send_from_directory(
            os.path.join(current_app.static_folder, 'exports'),
            export,
            as_attachment=True)
    except Exception as e:
        return str(e)
