# -*- coding:utf-8 -*-
# 分类相关接口
from flask import Blueprint, request
from ext import trueReturn, falseReturn, mongoDBHelper
from bson import ObjectId

category = Blueprint('category', __name__)


@category.route('/category', methods=['GET'])
def get_category_data():
    db = mongoDBHelper('MOOP_SERVICE')
    dataList = db.category.aggregate([
        {'$match': {'delete': False}},
        {"$lookup": {'from': 'type', 'localField': '_id', 'foreignField': 'category', 'as': 'detail'}}
    ])
    result = []
    for d in dataList:
        result.append({
            'categoryid': str(d['_id']),
            'name': d['name'],
            'types': list(map(lambda x: {'typeid': str(x['_id']), 'name': x['name']}, d['detail']))
        })
    return trueReturn(result)


@category.route('/category', methods=['POST'])
def add_category_data():
    name = request.json.get('name', None)
    if name:
        db = mongoDBHelper('MOOP_SERVICE')
        db.category.update({'name': name}, {'$set': {'name': name, 'delete': False}}, True, False)
        return trueReturn('添加成功')
    else:
        return falseReturn('参数错误')


@category.route('/category', methods=['PATCH'])
def update_category_data():
    categoryid = request.json.get('categoryid', None)
    name = request.json.get('name', None)
    if categoryid and name:
        db = mongoDBHelper('MOOP_SERVICE')
        db.category.update({'_id': ObjectId(categoryid)}, {'$set': {'name': name}})
        return trueReturn('修改成功')
    else:
        return falseReturn('参数错误')


# 向某一个分类中添加学科
@category.route('/category/type', methods=['POST'])
def add_category_type_data():
    categoryid = request.json.get('categoryid', None)
    name = request.json.get('name', None)
    db = mongoDBHelper('MOOP_SERVICE')
    c = db.category.find_one({'_id': ObjectId(categoryid)})
    if c:
        db.type.update({'name': name, 'category': c['_id']},
                       {'$set': {'category': c['_id'], 'name': name, 'delete': False}}, True, False)
        return trueReturn('添加成功')
    else:
        return falseReturn('参数错误')


# 修改某一个分类中的学科名字
@category.route('/category/type', methods=['PATCH'])
def update_category_type_data():
    categoryid = request.json.get('categoryid', None)
    typeid = request.json.get('typeid', None)
    name = request.json.get('name', None)
    db = mongoDBHelper('MOOP_SERVICE')
    c = db.category.find_one({'_id': ObjectId(categoryid)})
    t = db.type.find_one({'_id': ObjectId(typeid)})
    if c and t:
        db.type.update({'_id': t['_id']}, {'$set': {'name': name}})
        return trueReturn('修改成功')
    else:
        return falseReturn('参数错误')
