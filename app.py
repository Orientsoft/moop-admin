# -*- coding:utf-8 -*-
from flask import Flask
from ext import falseReturn
from flask_cors import *

app = Flask(__name__)
app.config.from_pyfile('config.py')
CORS(app, supports_credentials=True)

from applications.history import history
from applications.login import login
from applications.category import category
from applications.tenant import tenant
from applications.image import image
from applications.project_image import projectImage
from applications.purchase import purchase

for blueprints in (history, login, category, tenant, image, projectImage, purchase):
    app.register_blueprint(blueprint=blueprints, url_prefix='/api/v1')


@app.errorhandler(Exception)
def error_handler(error):
    logging.error(error)
    return falseReturn('服务异常')


if __name__ == '__main__':
    import logging
    logging.basicConfig(format=app.config['LOG_FORMAT'], level=logging.INFO,
                        datefmt='%Y-%m-%d %H:%M:%S')
    app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=app.config['PORT'], threaded=True)
