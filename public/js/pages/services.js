define(['preact', 'util', 'components/table', 'components/dialog'], function (preact, util, Table, Dialog) {
  class Services extends preact.Component {
    constructor() {
      super();
      this.state = {
        tab: 'namespaces',
        visible: null,
        current: null,
        options: [],
        dataSource: [],
      };
      this.columns = [
        {
          title: '名称',
          field: 'containerName',
        },
        {
          title: '镜像',
          field: 'image',
        },
        {
          title: '命名空间',
          field: 'namespace',
        },
        {
          title: '采集时间',
          field: 'collectTime',
          render: value => util.datetime(value),
        },
        {
          title: '状态',
          field: 'status',
        },
      ];
      this.actions = [
        item => preact.html`<a onClick=${() => this.setState({ visible: { ...item } })}>详情</a>`,
      ];
    }

    onQuery({ name, namespace }) {
      if (this.state.tab === 'namespaces') {
        $.get(`/namespace/${namespace}`, services => this.setState({ dataSource: services.data }));
      } else {
        $.get(`/pods/${namespace}`, services => this.setState({ dataSource: services.data }));
      }
      this.setState({ current: name });
    }

    refresh(tab) {
      if (tab) {
        if (tab !== this.state.tab) {
          this.setState({
            tab,
            current: null,
            visible: null,
          });
        }
      } else {
        tab = this.state.tab;
      }
      if (tab === 'namespaces') {
        $.get('/tenants',({ data = [] }) => {
          this.setState({ options: data });
          if (data[0] && data[0].namespace) {
            $.get(`/namespace/${data[0].namespace}`, services => this.setState({ dataSource: services.data }));
          } else {
            this.setState({ dataSource: [] });
          }
        });
      } else {
        $.get('/pods', ({ data = [] }) => {
          this.setState({ options: data.map(pod => ({
            name: pod,
            namespace: pod,
          })) });
          if (data[0]) {
            $.get(`/pods/${data[0]}`, services => this.setState({ dataSource: services.data }));
          } else {
            this.setState({ dataSource: [] });
          }
        });
      }
    }

    componentDidMount() {
      this.refresh();
    }

    shouldComponentUpdate(nextProps, nextState) {
      const { dataSource, tab, visible } = this.state;

      return tab !== nextState.tab || dataSource !== nextState.dataSource || visible !== nextState.visible;
    }

    render(props, { dataSource, tab, current, options, visible }) {
      const header = preact.html`
        <div class="pull-right">
          <span>当前选择：</span>
          <span class="sui-dropdown dropdown-bordered dropdown-large">
            <span class="dropdown-inner">
              <a role="button" data-toggle="dropdown" class="dropdown-toggle">${current || util.get(options[0], 'name')}<i class="caret"></i></a>
              <ul role="menu" class="sui-dropdown-menu">
                ${options.map(option => preact.html`<li class=${current === option.name ? 'active' : ''}><a role="menuitem" tabindex="-1" onClick=${() => this.onQuery(option)}>${option.name}</a></li>`)}
              </ul>
            </span>
          </span>
        </div>
      `;

      return preact.html`
        <div style="float:left; width:100%;">
          <ul class="sui-nav nav-tabs nav-large nav-primary">
            <li class=${tab === 'namespaces' ? 'active' : ''}><a onClick=${() => this.refresh('namespaces')}>NAMESPACES</a></li>
            <li class=${tab === 'pods' ? 'active' : ''}><a onClick=${() => this.refresh('pods')}>PODS</a></li>
          </ul>
          <${Table} columns=${this.columns} dataSource=${dataSource} header=${header} actions=${this.actions} />
          <${Dialog} visible=${visible} title="详情" onOk=${() => this.setState({ visible: null })}>
            <textarea rows="12" readonly>${JSON.stringify(visible, null, 4)}</textarea>
          <//>
        </div>
      `;
    }
  }

  return Services;
});
