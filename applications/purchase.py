# -*- coding:utf-8 -*-
# 授权管理接口
from flask import Blueprint, request
from ext import trueReturn, mongoDBHelper
from bson import ObjectId

purchase = Blueprint('puchase', __name__)


@purchase.route('/purchase', methods=['GET'])
def get_purchase():
    db = mongoDBHelper()
    purchase_list = list(db.purchase.find({'delete': False}))
    project_list = list(db.project.find({'delete': False}))
    image_list = list(db.image.find({'delete': False}))
    image_dict = {}
    for image in image_list:
        image['_id'] = str(image['_id'])
        image_dict[image['_id']] = image
    project_dict = {}
    for project in project_list:
        project_dict[project['_id']] = {
            '_id': str(project['_id']),
            'title': project['title'],
            'description': project['description'],
            'timeConsume': project['timeConsume'],
            'createdAt': project['createdAt'],
            'updatedAt': project['updatedAt'],
            'labs': project['labs'],
            'spec': project['spec'],
            'repoName': project['repoName'],
            'hisUrl': project.get('hisUrl'),
            'image': image_dict[str(project['image'])]
        }
    for purchase in purchase_list:
        purchase['project'] = project_dict.get(purchase['project']) if project_dict.get(purchase['project']) else {
            '_id': None,
            'title': None,
            'description': None,
            'timeConsume': None,
            'createdAt': None,
            'updatedAt': None,
            'labs': None,
            'spec': None,
            'repoName': None,
            'hisUrl': None,
            'image': None
        }
        purchase['_id'] = str(purchase['_id'])
        purchase['purchaser'] = str(purchase['purchaser'])
    return trueReturn(purchase_list)


@purchase.route('/purchase', methods=['POST'])
def insert_purchase():
    from datetime import datetime
    db = mongoDBHelper()
    purchase = request.json()
    db.purchase.update_one({
        'purchaser': ObjectId(purchase['tenantid']),
        'project': ObjectId(purchase['projectid']),
        'limit': datetime.strftime(purchase['expire'], '%Y-%m-%d'),
        'createdAt': datetime.now(),
        'updatedAt': datetime.now(),
        'remark': purchase.get('remark'),
        'delete': False
    })
    return trueReturn('insert success')


@purchase.route('/purchase', methods=['PATCH'])
def update_purchase():
    from datetime import datetime
    db = mongoDBHelper()
    purchaseId = request.json.get('purchaseid')
    limit = request.json.get('limit')
    db.purchase.update_one({'_id': ObjectId(purchaseId)}, {'$set': {
        'limit': datetime.strftime(limit, '%Y-%m-%d'),
        'updatedAt': datetime.now()
    }})
    return trueReturn('update success')


@purchase.route('/purchase', methods=['DELETE'])
def delete_purchase():
    db = mongoDBHelper()
    purchaseId = request.json.get('purchaseid')
    db.purchase.update({'_id': ObjectId(purchaseId)}, {'$set': {'delete': True}})
    return trueReturn('delete success')
