import logging

from flask import current_app, jsonify

from geonature.utils.env import DB
from geonature.utils.utilssqlalchemy import json_resp
from geonature.utils.errors import GeonatureApiError

from sqlalchemy.exc import SQLAlchemyError

log = logging.getLogger(__name__)
gunicorn_error_logger = logging.getLogger('gunicorn.error')


@current_app.errorhandler(500)
@json_resp
def internal_error(error):  # pylint: disable=W0613
    gunicorn_error_logger.info(error)
    DB.session.rollback()
    return {'message': 'internal server error'}, 500

@current_app.errorhandler(SQLAlchemyError)
@json_resp
def sqlalchemy_error(error):  # pylint: disable=W0613
    gunicorn_error_logger.info(error)
    DB.session.rollback()
    return {'message': 'internal server error'}, 500


@current_app.errorhandler(GeonatureApiError)
def geonature_api_error(error):
    gunicorn_error_logger.info(error.to_dict())
    DB.session.rollback()
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response