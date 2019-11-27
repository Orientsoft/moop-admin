define(['preact', 'components/table', 'components/dialog'], function (preact, Table, Dialog) {
  const DialogType = {
    CATEGORY1: 'dialog-category1',
    CATEGORY2: 'dialog-category2',
    ADD_CATEGORY1: 'dialog-add-category1',
  };

  class Categories extends preact.Component {
    constructor() {
      super();
      this.state = {
        dataSource: [],
        visible: null,
      };
      this.columns = [
        {
          title: '一级分类',
          field: 'name',
          render: (value, i, item) => preact.html`<a onClick=${() => this.showCategory1(item)}>${value}</a>`,
        },
        {
          title: '二级分类',
          field: 'name',
          render: (value, i, item, parent) => preact.html`<a onClick=${() => this.showCategory2(item, parent)}>${value}</a>`,
        },
      ];
      this.header = preact.html`
        <button class="sui-btn btn-primary btn-large pull-right" onClick=${() => this.setState({ visible: DialogType.ADD_CATEGORY1 })}>新增一级分类</button>
      `;
    }

    onAddCategory1() {
      const name = document.forms[DialogType.ADD_CATEGORY1].name;
      const value = name.value.trim();

      if (value.length) {
        $.post('/category', JSON.stringify({ name: value }), () => {
          name.value = '';
          this.setState({ visible: null });
          this.refresh();
        });
      }
    }

    showCategory1(item) {
      const name = document.forms[DialogType.CATEGORY1].name;

      name.value = item.name;
      this.category1 = {
        categoryid: item.categoryid,
        name: item.name,
      };
      this.setState({ visible: DialogType.CATEGORY1 });
    }

    onModifyCategory1() {
      const name = document.forms[DialogType.CATEGORY1].name;
      const category = document.forms[DialogType.CATEGORY1].category;
      let value = name.value.trim();
      
      if (value.length && value !== this.category1.name) {
        $.ajax({
          url: '/category',
          method: 'PATCH',
          data: JSON.stringify({ ...this.category1, name: value }),
          success: () => {
            category.value = '';
            delete this.category1;
            this.refresh();
          },
        });
      }
      value = category.value.trim();
      if (value.length) {
        $.ajax({
          url: '/category/type',
          method: 'POST',
          data: JSON.stringify({ ...this.category1, name: value }),
          success: () => {
            category.value = '';
            delete this.category1;
            this.refresh();
          },
        });
      }
      this.setState({ visible: null });
    }

    showCategory2(item, parent) {
      const name = document.forms[DialogType.CATEGORY2].name;

      name.value = item.name;
      this.category2 = {
        categoryid: parent.categoryid,
        typeid: item.typeid,
      };
      this.setState({ visible: DialogType.CATEGORY2 });
    }

    onModifyCategory2() {
      const name = document.forms[DialogType.CATEGORY2].name;
      const value = name.value.trim();

      if (value.length) {
        $.ajax({
          url: '/category/type',
          method: 'PATCH',
          data: JSON.stringify({ ...this.category2, name: value }),
          success: () => {
            delete this.category2;
            this.refresh();
          },
        });
      }
      this.setState({ visible: null });
    }

    refresh() {
      $.get('/category',(data) => {
        this.setState({
          dataSource: data.data.map((item) => {
            const { types, ...rest } = item;
            return {
              children: types,
              ...rest,
            };
          }),
        });
      });
    }

    componentDidMount() {
      this.refresh();
    }

    render(props, { dataSource, visible }) {
      return preact.html`
        <div>
          <${Table.Categories} columns=${this.columns} dataSource=${dataSource} header=${this.header} />
          <${Dialog} visible=${visible === DialogType.ADD_CATEGORY1} title="新增一级分类" onOk=${() => this.onAddCategory1()}>
            <form class="sui-form form-horizontal" id=${DialogType.ADD_CATEGORY1}>
              <div class="control-group">
                <label class="control-label">名称：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="name" type="text" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.CATEGORY1} title="一级分类管理" onOk=${() => this.onModifyCategory1()}>
            <form class="sui-form form-horizontal" id=${DialogType.CATEGORY1}>
              <div class="control-group">
                <label class="control-label">修改名称：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="name" type="text"/>
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">新增二级：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="category" type="text" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.CATEGORY2} title="二级分类管理" onOk=${() => this.onModifyCategory2()}>
            <form class="sui-form form-horizontal" id=${DialogType.CATEGORY2}>
              <div class="control-group">
                <label class="control-label">修改名称：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="name" type="text" />
                </div>
              </div>
            </form>
          <//>
        </div>
      `;
    }
  }

  return Categories;
});
