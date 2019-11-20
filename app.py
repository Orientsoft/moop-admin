# -*- coding:utf-8 -*-
from flask import Flask
from ext import falseReturn

app = Flask(__name__)
app.config.from_pyfile('config.py')

from applications.history import history
from applications.login import login
from applications.category import category
from applications.tenant import tenant

app.register_blueprint(history)
app.register_blueprint(login)
app.register_blueprint(category)
app.register_blueprint(tenant)


@app.errorhandler(Exception)
def error_handler(error):
    return falseReturn('服务异常')


if __name__ == '__main__':
    app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=app.config['PORT'], threaded=True)
