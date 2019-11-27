define(['preact', 'util'], function (preact, util) {
  const Table = ({ columns = [], dataSource = [], actions = [], header }) => preact.html`
    <table class="sui-table table-bordered">
      <thead>
        ${header && preact.html`
          <tr>
            <th colspan=${columns.length + (actions.length ? 2 : 1)}>${header}</th>
          </tr>
        `}
        <tr>
          <th width="36">序号</th>
          ${columns.map(({ title, width }) => preact.html`<th width=${width}>${title}</th>`)}
          ${actions.length > 0 && preact.html`<th class="center">操作</th>`}
        </tr>
      </thead>
      <tbody>
        ${dataSource.map((item, i) => preact.html`
          <tr>
            <td>${util.padding(i + 1, 3)}</td>
            ${columns.map(({ field, render = util.identity }) => preact.html`<td>${render(util.get(item, field), i, item, dataSource)}</td>`)}
            ${actions.length > 0 && preact.html`<td class="center">${actions.map(action => action(item, i, dataSource))}</td>`}
          </tr>
        `)}
      </tbody>
    </table>
  `;

  Table.Categories = ({ columns = [], dataSource = [], actions = [], header }) => preact.html`
    <table class="sui-table table-bordered">
      <thead>
        ${header && preact.html`
          <tr>
            <th colspan=${actions.length ? 4 : 3}>${header}</th>
          </tr>
        `}
        <tr>
          <th width="36">序号</th>
          ${columns.map(({ title, width }) => preact.html`<th width=${width}>${title}</th>`)}
          ${actions.length > 0 && preact.html`<th class="center">操作</th>`}
        </tr>
      </thead>
      <tbody>
        ${columns.length > 0 && dataSource.map((item, i) => {
          let children = util.get(item, 'children', []);
          const { field: field0, render: render0 = util.identity } = columns[0];

          if (children.length > 0 && columns.length > 1) {
            const rowspan = children.length;
            const { field: field1, render: render1 = util.identity } = columns[1];

            return children.map((child, j) => preact.html`
              <tr>
                ${j === 0 && preact.html`<td rowspan=${rowspan}>${util.padding(i + 1, 3)}</td>`}
                ${j === 0 && preact.html`<td rowspan=${rowspan}>${render0(util.get(item, field0), i, item, dataSource)}</td>`}
                <td>${render1(util.get(child, field1), j, child, item)}</td>
                ${actions.length > 0 && preact.html`<td class="center">${actions.map(action => action(child, i, item))}</td>`}
              </tr>
            `);
          }

          return preact.html`
            <tr>
              <td>${util.padding(i + 1, 3)}</td>
              <td>${render0(util.get(item, field0), i, item, dataSource)}</td>
              <td></td>
              ${actions.length > 0 && preact.html`<td class="center">${actions.map(action => action(null, -1, item))}</td>`}
            </tr>
          `;
        })}
      </tbody>
    </table>
  `;

  return Table;
});
