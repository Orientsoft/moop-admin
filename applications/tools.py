from flask import make_response, session, redirect
from functools import wraps
import logging


def login_required(f):
    @wraps(f)
    def session_function(*args, **kwargs):
        try:
            if 'unionid' not in session:
                return '请登录', 403
        except Exception as e:
            return '后台异常', 500
        return f(*args, **kwargs)

    return session_function
