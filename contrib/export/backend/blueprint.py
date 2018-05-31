import os
import datetime
import psycopg2
from flask import (
    Blueprint, request, current_app, send_from_directory, request, jsonify)
from geonature.utils.env import DB
from geonature.utils.errors import GeonatureApiError
from geonature.utils.utilssqlalchemy import json_resp
# from geonature.core.users.models import TRoles, UserRigth
# from pypnusershub.db.tools import InsufficientRightsError
# from pypnusershub import routes as fnauth

from .models import Export


blueprint = Blueprint('export', __name__)


@blueprint.route('/add', methods=['GET'])
# @fnauth.check_auth_cruved('R')
def add():
    selection = request.args.get('selection', None) or [
            'nomCite',
            'dateDebut', 'dateFin',
            'heureDebut', 'heureFin',
            'altMax', 'altMin',
            'cdNom', 'cdRef'
        ]
    export = Export(selection)
    submissionID = export.submission
    DB.session.add(export)
    DB.session.commit()
    # utc datetime Export.submission -> µs timestamp submissionID
    submissionID = (
        datetime.datetime.strptime(str(submissionID), '%Y-%m-%d %H:%M:%S.%f') -
        datetime.datetime.utcfromtimestamp(0)).total_seconds()
    return jsonify(id=submissionID, selection=selection)


@blueprint.route('/progress/<submissionID>')
def progress(submissionID):
    try:
        # µs timestamp submissionID -> utc datetime Export.submission
        submission = datetime.datetime.utcfromtimestamp(float(submissionID))
        # ranking: 'SELECT COUNT(submission) FROM gn_intero.t_exports WHERE status = -2 AND submission < %s', submission)
        export = Export.query.get(submission)
        return jsonify(
                submission=submission,
                status=str(export.status),
                start=str(export.start),
                end=str(export.end),
                log=str(export.log)
            ) if export else jsonify(submission='null')
    except ValueError as e:
        return jsonify(str(e))


@blueprint.route('/exports/<path:export>')
# @fnauth.check_auth_cruved('R')
def getExport(export):
    try:
        return send_from_directory(
            os.path.join(current_app.static_folder, 'exports'),
            export, as_attachment=True)
    except Exception as e:
        return str(e)
