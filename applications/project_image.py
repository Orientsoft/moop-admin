# -*- coding:utf-8 -*-
# 实验模板管理接口
from flask import Blueprint, request
from ext import trueReturn, mongoDBHelper
from bson import ObjectId

projectImage = Blueprint('projectImage', __name__)


@projectImage.route('/projects', methods=['GET'])
def project_list():
    # 获取实验模板列表，展开镜像内容
    db = mongoDBHelper()
    data_list = list(db.project.find({'delete': False}))
    image_list = list(db.image.find({'delete': False}))
    # type_list = list(db.type.find({'delete': False}))
    # category_list = list(db.category.find({'delete': False}))
    # category_dict = {}
    # type_dict = {}
    # for category in category_list:
    #     # category['_id'] = str(category['_id'])
    #     category_dict[category['_id']] = category
    # for type in type_list:
    #     # type['_id'] = str(type['_id'])
    #     type['category'] = category_dict[type['category']]
    #     type_dict[type['_id']] = type
    image_dict = {}
    for image in image_list:
        image['_id'] = str(image['_id'])
        image_dict[image['_id']] = image
    for data in data_list:
        #     data['image'] = image_dict[data['image']]
        #     data['tag'] = type_dict[data['tag']]
        data['_id'] = str(data['_id'])
        data['creator'] = str(data['creator'])
        data['image'] = image_dict[str(data['image'])]
        del data['tag']
    return trueReturn(data_list)


@projectImage.route('/projects', methods=['PATCH'])
def change_project_image():
    # 修改实验模板依赖镜像，不修改其他内容
    db = mongoDBHelper()
    projectId = request.json.get('projectid')
    imageId = request.json.get('imageid')
    db.project.update({'_id': ObjectId(projectId)}, {'$set': {'image': ObjectId(imageId)}})
    return trueReturn('update success')
