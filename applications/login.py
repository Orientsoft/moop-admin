# -*- coding:utf-8 -*-
# 登陆相关接口
from flask import Blueprint, request, session
from ext import trueReturn, falseReturn
import requests
import logging

login = Blueprint('login', __name__)


@login.route('/login', methods=['GET'])
def api_login():
    try:

        code = request.args['code']
        resp = get_token(code)
        if 'errcode' not in resp:
            userinfo = get_userinfo(resp['access_token'], resp['openid'])
            logging.info(userinfo)
            if 'errcode' not in userinfo:
                from ext import mongoDBHelper
                db = mongoDBHelper()
                db.user.update({'unionid': userinfo['unionid']}, {'$set': userinfo}, True, False)
                u = db.user.find_one({'unionid': userinfo['unionid']})
                if 'isAdmin' in u and u['isAdmin'] == 1:
                    session['unionid'] = userinfo['unionid']
                    session.permanent = True
                    return trueReturn('登陆成功')
                else:
                    return falseReturn('暂无权限，请联系管理员授权')
            else:
                return falseReturn('获取用户信息失败')
        else:
            return falseReturn('code有误')
    except Exception as e:
        logging.info(e)
        return falseReturn('登陆异常')


def get_token(code):
    from app import app
    payload = {
        "appid": app.config["APPID"],
        "secret": app.config["SECERT"],
        "code": code,
        "grant_type": "authorization_code"
    }
    resp = requests.get('https://api.weixin.qq.com/sns/oauth2/access_token', params=payload).json()
    return resp


def get_userinfo(access_token, openid):
    payload = {
        'access_token': access_token,
        'openid': openid
    }
    # 存储token
    resp = requests.get('https://api.weixin.qq.com/sns/userinfo', params=payload).json()
    return resp
