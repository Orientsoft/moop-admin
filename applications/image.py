# -*- coding:utf-8 -*-
# 镜像管理接口
from flask import Blueprint, request
from ext import trueReturn, mongoDBHelper
from bson import ObjectId

image = Blueprint('image', __name__)


@image.route('/images', methods=['GET'])
def get_images():
    db = mongoDBHelper('MOOP_SERVICE')
    image_list = list(db.image.find({'delete': False}))
    for image in image_list:
        image['_id'] = str(image['_id'])
    return trueReturn(image_list)


@image.route('/images', methods=['POST'])
def insert_image():
    db = mongoDBHelper('MOOP_SERVICE')
    image = request.json
    db.image.insert_one({
        'url': '%s:%s' % (image['url'], image['tag']),
        'desc': image['desc'],
        'package': image['package'],
        'delete': False
    })
    return trueReturn('insert success')


@image.route('/images', methods=['PATCH'])
def update_image():
    db = mongoDBHelper('MOOP_SERVICE')
    image = request.json
    db.image.update({'_id': ObjectId(image['imageid'])}, {'$set': {
        'url': '%s:%s' % (image['url'], image['tag']),
        'desc': image['desc'],
        'package': image['package']
    }})
    return trueReturn('update success')
