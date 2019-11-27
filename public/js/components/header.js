define(['preact', 'util'], function (preact, util) {
  const Header = ({ user, onLogout = util.noop }) => {
    return preact.html`
      <div class="sui-navbar">
        <div class="navbar-inner">
          <div class="sui-container">
            <a href="/" class="sui-brand">moop-admin</a>
            ${user ? preact.html`
              <form class="sui-form sui-form pull-right">
                <a href="/" class="sui-btn btn-primary">登录</a>
              </form>
            ` : preact.html`
              <ul class="sui-nav pull-right">
                <li><a href="#">用户名</a></li>
                <li><a onClick=${onLogout}>退出</a></li>
              </ul>
            `}
          </div>
        </div>
      </div>
    `;
  };

  return Header;
});
