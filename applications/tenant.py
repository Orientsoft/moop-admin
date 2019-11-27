# -*- coding:utf-8 -*-
# 租户信息相关接口
from flask import Blueprint, request
from ext import trueReturn, falseReturn, mongoDBHelper
from bson import ObjectId
from applications.tools import login_required

tenant = Blueprint('tenant', __name__)


@tenant.route('/tenants', methods=['GET'])
@login_required
def get_tenant_data():
    db = mongoDBHelper('MOOP_SERVICE')
    dataList = db.tenant.find({'delete': False})
    result = []
    for d in dataList:
        result.append({
            'tenantid': str(d['_id']),
            'createAt': d['createdAt'],
            'name': d['name'],
            'namespace': d['namespace'],
            'limit': d['limit'],
            'remark': d['remark'],
            'resources': d['resources']
        })
    return trueReturn(result)


@tenant.route('/tenants', methods=['PATCH'])
@login_required
def update_tenant_data():
    tenantid = request.json.get('tenantid', None)
    limit = request.json.get('limit', None)
    db = mongoDBHelper('MOOP_SERVICE')
    tenant = db.tenant.find_one({'_id': ObjectId(tenantid)})
    if tenant and limit:
        db.tenant.update({'_id': tenant['_id']}, {'$set': {'limit': int(limit)}})
        return trueReturn('修改成功')
    else:
        return falseReturn('参数错误')


@tenant.route('/tenants', methods=['POST'])
@login_required
def add_tenant_data():
    length = len(request.json['namespace'])
    if length >12:
        return falseReturn('名空间不能超过12位')
    body = {
        "activated": True,
        "logo": None,
        "name": request.json['name'],
        "namespace": request.json['namespace'],
        "remark": request.json['remark'],
        "resources": {
            "templates": {
                "pod": {
                    "apiVersion": "v1",
                    "kind": "Pod",
                    "metadata": {
                        "name": "job-{}-{}"
                    },
                    "spec": {
                        "containers": [
                            {
                                "args": [
                                    "/bin/sh",
                                    "-c",
                                    "{}"
                                ],
                                "image": "registry.mooplab.com:8443/gitbox/alpine-git:lastest",
                                "imagePullPolicy": "IfNotPresent",
                                "name": "copy",
                                "volumeMounts": []
                            }
                        ],
                        "restartPolicy": "Never",
                        "ttlSecondsAfterFinished": 0,
                        "volumes": []
                    }
                },
                "pv": {
                    "apiVersion": "v1",
                    "kind": "PersistentVolume",
                    "metadata": {
                        "name": "pv-{}-{}-{}",
                        "namespace": "{}",
                        "labels": {
                            "pv": "pv-{}-{}-{}"
                        }
                    },
                    "spec": {
                        "accessModes": ["ReadWriteMany"],
                        "capacity": {
                            "storage": "100Mi"
                        },
                        "nfs": {
                            "server": "{}",
                            "path": "{}{}"
                        }
                    }
                },
                "match_pvc": {
                    "apiVersion": "v1",
                    "kind": "PersistentVolumeClaim",
                    "metadata": {
                        "name": "pvc-{}-{}-{}",
                        "namespace": "{}"
                    },
                    "spec": {
                        "accessModes": [
                            "ReadWriteMany"
                        ],
                        "resources": {
                            "requests": {
                                "storage": "100Mi"
                            }
                        },
                        "selector": {
                            "matchLabels": {
                                "pv": "pv-{}-{}-{}"
                            }
                        },
                        "storageClassName": ""
                    }
                },
                "pvc": {
                    "apiVersion": "v1",
                    "kind": "PersistentVolumeClaim",
                    "metadata": {
                        "name": "pvc-{}-{}-{}",
                        "namespace": "{}"
                    },
                    "spec": {
                        "accessModes": ["ReadWriteMany"],
                        "storageClassName": "standard",
                        "resources": {
                            "requests": {
                                "storage": "100Mi"
                            }
                        }
                    }
                }
            }
        }
    }
    db = mongoDBHelper('MOOP_SERVICE')
    db.tenant.insert(body)
    return trueReturn('新增成功')
