define(['preact', 'util'], function (preact, util) {
  const Sidebar = ({ dataSource = [], active, onChange = util.noop }) => preact.html`
    <div class="sidebar">
      <ul class="sui-nav nav-tabs nav-primary nav-xlarge tab-vertical">
        ${dataSource.map(item => preact.html`
          <li class=${item.name === active ? 'active' : ''}>
            <a onClick=${() => onChange(item.name)}>${item.label}</a>
          </li>
        `)}
      </ul>
    </div>
  `;

  return Sidebar;
});
