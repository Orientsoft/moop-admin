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
        if (request.status === 403) {
          if (sessionStorage.getItem(USER)) {
            this.onLogout();
          }
        } else {
          this.setState({
            error: `${request.status} - ${request.statusText}`,
          });
        }
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

    onLogin() {
      let { username, password } = document.forms.user;

      username = username.value.trim();
      password = password.value.trim();
      if (username && password) {
        $.post('/login', JSON.stringify({
          username,
          password,
        }), (data) => {
          if (data.status) {
            sessionStorage.setItem(USER, JSON.stringify(data.data));
            location.reload();
          } else {
            this.setState({ error: data.message });
          }
        });
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

      return preact.html`
        <div class="sui-layout">
          <${Header} user=${user} onLogout=${() => this.onLogout()} />
          ${error && preact.html`
            <div class="sui-msg msg-large msg-block msg-error">
              <div class="msg-con">${error}</div>
              <s class="msg-icon"></s>
            </div>
          `}
          ${user ? preact.html`
            <div class="page">
              <${Sidebar} active=${current} dataSource=${pages} onChange=${page => this.onPageChange(page)} />
              <div class="content">
                ${page && preact.html`<${page.component} />`}
              </div>
            </div>
          ` : preact.html`
            <div class="qrcode">
              <form class="sui-form form-horizontal" style="width: 260px; margin: auto;" id="user">
                <div class="control-group">
                  <label class="control-label">账号：</label>
                  <input class="input-large input-fat" name="username" type="text" />
                </div>
                <div class="control-group">
                  <label class="control-label">密码：</label>
                  <input class="input-large input-fat" name="password" type="text" />
                </div>
                <a onClick=${() => this.onLogin()} class="sui-btn btn-primary">登录</a>
              </form>
            </div>
          `}
        </div>
      `;
    }
  }

  return preact.html`<${App} />`;
});
