define(function (require) {
  return {
    pages: [
      {
        name: 'categories',
        label: '学科分类管理',
        component: require('pages/categories'),
      },
      {
        name: 'services',
        label: '服务版本管理',
        component: require('pages/services')
      },
      {
        name: 'tenants',
        label: '租户管理',
        component: require('pages/tenants')
      },
      {
        name: 'images',
        label: '镜像管理',
        component: require('pages/images')
      },
      {
        name: 'projects',
        label: '实验模版管理',
        component: require('pages/projects')
      },
      {
        name: 'purchase',
        label: '授权管理',
        component: require('pages/purchase')
      },
    ],
  };
});
