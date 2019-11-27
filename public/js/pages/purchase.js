define(['preact', 'util', 'components/table', 'components/dialog'], function (preact, util, Table, Dialog) {
  const DialogType = {
    ADD_PURCHASE: 'dialog-add-purchase',
    EXPIRE: 'dialog-expire',
    DELETE: 'dialog-delete',
  };

  class Purchase extends preact.Component {
    constructor() {
      super();
      this.state = {
        dataSource: [],
        tenants: [],
        projects: [],
        purchase: {},
        current: [],
        visible: null,
      };
      this.columns = [
        {
          title: '模版',
          field: 'projecttitle',
        },
        {
          title: '租户',
          field: 'tenantname',
        },
        {
          title: '命名空间',
          field: 'namespace',
        },
        {
          title: '过期时间',
          field: 'limit',
          render: (value, i, item) => preact.html`<a onClick=${() => this.showExpire(item)}>${value}</a>`,
        },
      ];
      this.actions = [
        item => preact.html`<a onClick=${() => this.showDelete(item)}>删除</a>`,
      ];
    }

    onAddPurchase() {
      const limit = document.forms[DialogType.ADD_PURCHASE].limit;
      const { tenantid, projectid } = this.state.purchase;

      if (tenantid && projectid) {
        $.post('/purchase', JSON.stringify({
          tenantid: tenantid,
          projectid: projectid,
          limit: limit.value,
        }), () => {
          this.setState({ visible: null, purchase: {} });
          this.refresh();
        });
      }
    }

    showExpire(item) {
      const limit = document.forms[DialogType.EXPIRE].limit;

      this.current = item;
      limit.value = item.limit;
      this.setState({ visible: DialogType.EXPIRE });
    }

    showDelete(item) {
      this.current = item;
      this.setState({ visible: DialogType.DELETE });
    }

    onModifyExpire() {
      const limit = document.forms[DialogType.EXPIRE].limit;
      
      if (limit.value !== this.current.limit) {
        $.ajax({
          url: '/purchase',
          method: 'PATCH',
          data: JSON.stringify({
            purchaseid: this.current.purchaseid,
            limit: limit.value,
          }),
          success: () => {
            delete this.current;
            this.setState({ visible: null });
            this.refresh();
          },
        });
      }
    }

    onDelete() {
      $.ajax({
        url: '/purchase',
        method: 'DELETE',
        data: JSON.stringify({ purchaseid: this.current.purchaseid }),
        success: () => {
          delete this.current;
          this.setState({ visible: null });
          this.refresh();
        },
      });
    }

    refresh(current) {
      if (current) {
        this.setState({ current });
        $.get(`/purchase?tenantid=${current.tenantid}`,(data) => this.setState({ dataSource: data.data }));
      } else {
        $.get('/purchase',(data) => this.setState({ dataSource: data.data }));
      }
    }

    componentDidMount() {
      this.refresh();
      $.get('/projects',(data) => this.setState({ projects: data.data }));
      $.get('/tenants',(data) => this.setState({ tenants: data.data }));
    }

    render(props, { dataSource, tenants, projects, purchase, current, visible }) {
      const header = preact.html`
        <div class="pull-right">
          <span>当前选择：</span>
          <span class="sui-dropdown dropdown-bordered dropdown-large">
            <span class="dropdown-inner">
              <a role="button" data-toggle="dropdown" class="dropdown-toggle">${current.name}<i class="caret"></i></a>
              <ul role="menu" class="sui-dropdown-menu">
                ${tenants.map(({ tenantid, name }) => preact.html`<li class=${current.tenantid === tenantid ? 'active' : ''}><a role="menuitem" tabindex="-1" onClick=${() => this.refresh({ tenantid, name })}>${name}</a></li>`)}
              </ul>
            </span>
          </span>
          <button class="sui-btn btn-primary btn-large pull-right" onClick=${() => this.setState({ visible: DialogType.ADD_PURCHASE, purchase: { limit: util.datetime(null, 'date') } })}>新增授权</button>
        </div>
      `;

      return preact.html`
        <div>
          <${Table} columns=${this.columns} dataSource=${dataSource} header=${header} actions=${this.actions} />
          <${Dialog} visible=${visible === DialogType.ADD_PURCHASE} title="新增授权" onOk=${() => this.onAddPurchase()}>
            <form class="sui-form form-horizontal" id=${DialogType.ADD_PURCHASE}>
              <div class="control-group">
                <label class="control-label">选择租户：</label>
                <div class="controls">
                  <ul role="menu" class="sui-dropdown-menu">
                    ${tenants.map(({ tenantid, name }) => preact.html`<li class=${purchase.tenantid === tenantid ? 'active' : ''}><a role="menuitem" tabindex="-1" onClick=${() => this.setState({ purchase: { ...purchase, tenantid } })}>${name}</a></li>`)}
                  </ul>
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">选择模版：</label>
                <div class="controls">
                  <ul role="menu" class="sui-dropdown-menu">
                    ${projects.map(({ _id, title }) => preact.html`<li class=${purchase.projectid === _id ? 'active' : ''}><a role="menuitem" tabindex="-1" onClick=${() => this.setState({ purchase: { ...purchase, projectid: _id } })}>${title}</a></li>`)}
                  </ul>
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">过期时间：</label>
                <div class="controls">
                  <input type="text" name="limit" data-toggle="datepicker" value=${purchase.limit} />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.EXPIRE} title="修改过期时间" onOk=${() => this.onModifyExpire()}>
            <form class="sui-form form-horizontal" id=${DialogType.EXPIRE}>
              <div class="control-group">
                <div class="controls">
                  <input type="text" name="limit" data-toggle="datepicker" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.DELETE} title="删除授权" onOk=${() => this.onDelete()}>
            <p>租户：<strong>${this.current && this.current.tenantname}</strong></p>
            <p>模版：<strong>${this.current && this.current.projecttitle}</strong></p>
          <//>
        </div>
      `;
    }
  }

  return Purchase;
});
