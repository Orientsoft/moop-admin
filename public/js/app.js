define(['preact', 'config', 'components/header', 'components/sidebar', 'config'], function (preact, config, Header, Sidebar) {
  const pages = config.pages;
  const USER = 'moop-admin@user';

  class App extends preact.Component {
    constructor() {
      super();
      this.state = {
        user: null,
        error: null,
        current: pages.length ? pages[0].name : null,
      };
      $(document).ajaxError((e, request) => {
        this.setState({
          error: `${request.status} - ${request.statusText}`,
        });
      });
      $(document).ajaxSuccess((e, request) => {
        if (request.responseJSON) {
          if (!request.responseJSON.status) {
            this.setState({ error: request.responseJSON.message });
          }
        }
      });
    }

    onPageChange(page) {
      if (page !== this.state.current) {
        this.setState({ current: page });
      }
    }

    onLogout() {
      sessionStorage.removeItem(USER);
      location.reload();
    }

    componentDidMount() {
      let user = sessionStorage.getItem(USER);
      
      try {
        user = JSON.parse(user);
        this.setState({ user });
      } catch (error) {}
    }

    render(props, { current, user, error }) {
      const page = pages.find(page => page.name === current);

      user = true;

      return preact.html`
        <div class="sui-layout">
          <${Header} user=${user} onLogout=${() => this.onLogout()} />
          ${user ? preact.html`
            <div class="page">
              ${error && preact.html`
                <div class="sui-msg msg-large msg-block msg-error">
                  <div class="msg-con">${error}</div>
                  <s class="msg-icon"></s>
                </div>
              `}
              <${Sidebar} active=${current} dataSource=${pages} onChange=${page => this.onPageChange(page)} />
              <div class="content">
                ${page && preact.html`<${page.component} />`}
              </div>
            </div>
          ` : preact.html`
            <div class="qrcode">
              二维码
            </div>
          `}
        </div>
      `;
    }
  }

  return preact.html`<${App} />`;
});
