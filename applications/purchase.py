# -*- coding:utf-8 -*-
# 授权管理接口
from flask import Blueprint, request
from ext import trueReturn, mongoDBHelper
from bson import ObjectId
from datetime import datetime
from applications.tools import login_required

purchase = Blueprint('puchase', __name__)


@purchase.route('/purchase', methods=['GET'])
@login_required
def get_purchase():
    db = mongoDBHelper('MOOP_SERVICE')
    # purchase_list = list(db.purchase.find({'delete': False}))
    # project_list = list(db.project.find({'delete': False}))
    # image_list = list(db.image.find({'delete': False}))
    # image_dict = {}
    # for image in image_list:
    #     image['_id'] = str(image['_id'])
    #     image_dict[image['_id']] = image
    # project_dict = {}
    # for project in project_list:
    #     project_dict[project['_id']] = {
    #         '_id': str(project['_id']),
    #         'title': project['title'],
    #         'description': project['description'],
    #         'timeConsume': project['timeConsume'],
    #         'createdAt': project['createdAt'],
    #         'updatedAt': project['updatedAt'],
    #         'labs': project['labs'],
    #         'spec': project['spec'],
    #         'repoName': project['repoName'],
    #         'hisUrl': project.get('hisUrl'),
    #         'image': image_dict[str(project['image'])]
    #     }
    # for purchase in purchase_list:
    #     purchase['project'] = project_dict.get(purchase['project']) if project_dict.get(purchase['project']) else {
    #         '_id': None,
    #         'title': None,
    #         'description': None,
    #         'timeConsume': None,
    #         'createdAt': None,
    #         'updatedAt': None,
    #         'labs': None,
    #         'spec': None,
    #         'repoName': None,
    #         'hisUrl': None,
    #         'image': None
    #     }
    #     purchase['_id'] = str(purchase['_id'])
    #     purchase['purchaser'] = str(purchase['purchaser'])
    result = []
    tenantid = request.args.get('tenantid', None)
    filterObj = {
        'delete': False
    }
    if tenantid:
        filterObj['purchaser'] = ObjectId(tenantid)
    dataList = db.purchase.aggregate([
        {'$match': filterObj},
        {"$lookup": {'from': 'tenant', 'localField': 'purchaser', 'foreignField': '_id', 'as': 'tenant'}},
        {"$lookup": {'from': 'project', 'localField': 'project', 'foreignField': '_id', 'as': 'project'}},
    ])
    for d in dataList:
        result.append({
            'tenantid': str(d['tenant'][0]['_id']),
            'tenantname': d['tenant'][0]['name'],
            'namespace': d['tenant'][0]['namespace'],
            'limit': datetime.strftime(d['limit'], '%Y-%m-%d'),
            'projecttitle': d['project'][0]['title'],
            'purchaseid': str(d['_id'])
        })
    return trueReturn(result)


@purchase.route('/purchase', methods=['POST'])
@login_required
def insert_purchase():
    db = mongoDBHelper('MOOP_SERVICE')
    purchase = request.json
    db.purchase.insert_one({
        'purchaser': ObjectId(purchase['tenantid']),
        'project': ObjectId(purchase['projectid']),
        'limit': datetime.strptime(purchase['limit'], '%Y-%m-%d'),
        'createdAt': datetime.now(),
        'updatedAt': datetime.now(),
        'remark': purchase.get('remark'),
        'delete': False
    })
    return trueReturn('insert success')


@purchase.route('/purchase', methods=['PATCH'])
@login_required
def update_purchase():
    from datetime import datetime
    db = mongoDBHelper('MOOP_SERVICE')
    purchaseId = request.json.get('purchaseid')
    limit = request.json.get('limit')
    db.purchase.update_one({'_id': ObjectId(purchaseId)}, {'$set': {
        'limit': datetime.strptime(limit, '%Y-%m-%d'),
        'updatedAt': datetime.now()
    }})
    return trueReturn('update success')


@purchase.route('/purchase', methods=['DELETE'])
@login_required
def delete_purchase():
    db = mongoDBHelper('MOOP_SERVICE')
    purchaseId = request.json.get('purchaseid')
    db.purchase.update({'_id': ObjectId(purchaseId)}, {'$set': {'delete': True}})
    return trueReturn('delete success')
