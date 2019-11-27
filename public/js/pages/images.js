define(['preact', 'components/table', 'components/dialog'], function (preact, Table, Dialog) {
  const DialogType = {
    ADD_IMAGE: 'dialog-add-image',
    MODIFY_IMAGE_DESC: 'dialog-modify-image-desc',
    MODIFY_IMAGE_PACKAGE: 'dialog-modify-image-package',
    MODIFY_IMAGE_TAG: 'dialog-modify-image-tag',
  };

  class Images extends preact.Component {
    constructor() {
      super();
      this.state = {
        dataSource: [],
        visible: null,
      };
      this.columns = [
        {
          title: '描述',
          field: 'desc',
          width: 200,
          render: (value, i, item) => preact.html`<a onClick=${() => this.showDesc(item)}>${value}</a>`,
        },
        {
          title: '镜像地址',
          field: 'url',
          render: (value, i, item) => preact.html`<a onClick=${() => this.showTag(item)}>${value}</a>`,
        },
        {
          title: '包',
          field: 'package',
          render: (value, i, item) => {
            const packages = value.join(', ');
            const style = `
              display: block;
              width: 160px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            `;
            return preact.html`<a onClick=${() => this.showPackage(item)} style=${style} title=${packages}>${packages || '--'}</a>`;
          },
        },
      ];
      this.header = preact.html`
        <button class="sui-btn btn-primary btn-large pull-right" onClick=${() => this.setState({ visible: DialogType.ADD_IMAGE })}>新增镜像</button>
      `;
    }

    showTag(item) {
      const url = document.forms[DialogType.MODIFY_IMAGE_TAG].url;

      this.image = item;
      url.value = item.url;
      this.setState({ visible: DialogType.MODIFY_IMAGE_TAG });
    }

    showDesc(item) {
      const desc = document.forms[DialogType.MODIFY_IMAGE_DESC].desc;

      this.image = item;
      desc.value = item.desc;
      this.setState({ visible: DialogType.MODIFY_IMAGE_DESC });
    }

    showPackage(item) {
      const pkg = document.forms[DialogType.MODIFY_IMAGE_PACKAGE].package;

      this.image = item;
      pkg.value = item.package.join('\n');
      this.setState({ visible: DialogType.MODIFY_IMAGE_PACKAGE });
    }

    onAddImage() {
      const desc = document.forms[DialogType.ADD_IMAGE].desc;
      const url = document.forms[DialogType.ADD_IMAGE].url;
      const pkg = document.forms[DialogType.ADD_IMAGE].package;
      const parts = url.value.trim().match(/^(.*:)(\w+)$/);

      if (desc.value.trim().length && parts) {
        $.post('/images', JSON.stringify({
          desc: desc.value.trim(),
          url: parts[1],
          tag: parts[2],
          package: pkg.value.split('\n').map(pkg => pkg.trim()).filter(pkg => pkg),
        }), () => {
          desc.value = '';
          url.value = '';
          tag.value = '';
          pkg.value = '';
          this.setState({ visible: null });
          this.refresh();
        });
      }
    }

    onModifyImage() {
      let desc = document.forms[DialogType.MODIFY_IMAGE_DESC].desc;
      const url = document.forms[DialogType.MODIFY_IMAGE_TAG].url;
      const pkg = document.forms[DialogType.MODIFY_IMAGE_PACKAGE].package;
      const parts = url.value.trim().match(/^(.*:)(\w+)$/);
      const data = { imageid: this.item._id };
      let isModified = false;

      desc = desc.value.trim();
      if (desc && desc !== this.image.desc) {
        data.desc = desc;
        isModified = true;
      }
      if (parts && parts[2]) {
        data.url = parts[1];
        data.tag = parts[2];
        isModified = true;
      }
      if (pkg.value.trim()) {
        data.package = pkg.value.split('\n').map(pkg => pkg.trim()).filter(pkg => pkg);
        isModified = true;
      }
      if (isModified) {
        $.ajax({
          url: '/images',
          method: 'PATCH',
          data: JSON.stringify(data),
          success: () => {
            delete this.image;
            this.setState({ visible: null });
            this.refresh();
          },
        });
      }
    }

    refresh() {
      $.get('/images',(data) => this.setState({ dataSource: data.data }));
    }

    componentDidMount() {
      this.refresh();
    }

    render(props, { dataSource, visible }) {
      return preact.html`
        <div>
          <${Table} columns=${this.columns} dataSource=${dataSource} header=${this.header} />
          <${Dialog} visible=${visible === DialogType.ADD_IMAGE} title="新增镜像" onOk=${() => this.onAddImage()}>
            <form class="sui-form form-horizontal" id=${DialogType.ADD_IMAGE}>
              <div class="control-group">
                <label class="control-label">描述：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="desc" type="text" />
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">地址：</label>
                <div class="controls">
                  <input class="input-large input-fat" name="url" type="text" />
                </div>
              </div>
              <div class="control-group">
                <label class="control-label">包：</label>
                <div class="controls">
                  <textarea rows="6" name="package" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.MODIFY_IMAGE_DESC} title="修改描述" onOk=${() => this.onModifyImage()}>
            <form class="sui-form form-horizontal" id=${DialogType.MODIFY_IMAGE_DESC}>
              <div class="control-group">
                <div class="controls">
                  <input class="input-large input-fat" name="desc" type="test" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.MODIFY_IMAGE_PACKAGE} title="修改包" onOk=${() => this.onModifyImage()}>
            <form class="sui-form form-horizontal" id=${DialogType.MODIFY_IMAGE_PACKAGE}>
              <div class="control-group">
                <div class="controls">
                  <textarea rows="6" name="package" />
                </div>
              </div>
            </form>
          <//>
          <${Dialog} visible=${visible === DialogType.MODIFY_IMAGE_TAG} title="修改镜像地址" onOk=${() => this.onModifyImage()}>
            <form class="sui-form form-horizontal" id=${DialogType.MODIFY_IMAGE_TAG}>
              <div class="control-group">
                <div class="controls">
                  <input class="input-large input-fat" name="url" type="text" />
                </div>
              </div>
            </form>
          <//>
        </div>
      `;
    }
  }

  return Images;
});
