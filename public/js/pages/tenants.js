define(['preact', 'components/table', 'components/dialog'], function (preact, Table, Dialog) {
  const DialogType = {
    ADD_TENANT: 'dialog-add-tenant',
    LIMIT: 'dialog-limit',
  };

  class Tenants extends preact.Component {
    constructor() {
      super();
      this.state = {
        dataSource: [],
        visible: null,
      };
      this.columns = [
        {
          title: '名称',
          field: 'name',
        },
        {
          title: '命名空间',
          field: 'namespace',
        },
        {
          title: '资源限制',
          field: 'limit',
          render: (value, i, item) => preact.html`<a onClick=${() => this.showLimit(item)}>${value}</a>`,
        },
      ];
      this.header = preact.html`
        <button class="sui-btn btn-primary btn-large pull-right" onClick=${() => this.setState({ visible: DialogType.ADD_TENANT })}>新增租户</button>
      `;
    }

    onAddTenant() {
      const namespace = document.forms[DialogType.ADD_TENANT].namespace;
      const name = document.forms[DialogType.ADD_TENANT].name;
      const remark = document.forms[DialogType.ADD_TENANT].remark;

      if (name.value.trim().length && namespace.value.trim().length) {
        $.post('/tenants', JSON.stringify({
          namespace: namespace.value.trim(),
          name: name.value.trim(),
          remark: remark.value.trim(),
        }), () => {
          namespace.value = '';
          name.value = '';
          remark.value = '';
          this.setState({ visible: null });
          this.refresh();
        });
      }
    }

    showLimit(item) {
      const limit = document.forms[DialogType.LIMIT].limit;

      limit.value = item.limit;
      this.limit = {
        tenantid: item.tenantid,
        limit: item.name,
      };
      this.setState({ visible: DialogType.LIMIT });
    }

    onModifyLimit() {
      const limit = document.forms[DialogType.LIMIT].limit;
      let value = limit.value.trim();
      
      if (value.length && value !== this.limit.limit) {
        const n = parseInt(value, 10);

        if (!isNaN(n) && n >= 0 && n.toString() === value) {
          $.ajax({
            url: '/tenants',
            method: 'PATCH',
            data: JSON.stringify({ ...this.limit, limit: value }),
            success: () => {
              delete this.limit;
              this.setState({ visible: null });
              this.refresh();
            },
          });
        }
      }
    }

    refresh() {
      $.get('/tenants',(data) => this.setState({ dataSource: data.data }));
    }

    componentDidMount() {
      this.refresh();
    }

    render(props, { dataSource, visible }) {
      return preact.html`
        <div>
          <${Table} columns=${this.columns} dataSource=${dataSource} header=${this.header} />
          <${Dialog} visible=${visible === DialogType.ADD_TENANT} title="新增租户" onOk=${() => this.onAddTenant()}>
            <form class="sui-form form-horizontal" id=${DialogType.ADD_TENANT}>
              <div class="control-group">
                <label class="control-label">命名空间：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="namespace" type="text" />
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">租户名称：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="name" type="text" />
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">租户备注：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="remark" type="text" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.LIMIT} title="修改资源限制" onOk=${() => this.onModifyLimit()}>
            <form class="sui-form form-horizontal" id=${DialogType.LIMIT}>
              <div class="control-group">
                <div class="controls">
                  <input class="input-large input-fat" name="limit" type="number" />
                </div>
              </div>
            </form>
          <//>
        </div>
      `;
    }
  }

  return Tenants;
});
