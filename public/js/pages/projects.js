define(['preact', 'util', 'components/table', 'components/dialog'], function (preact, util, Table, Dialog) {
  const DialogType = {
    MODIFY_IMAGE: 'dialog-modify-image',
  };

  class Projects extends preact.Component {
    constructor() {
      super();
      this.state = {
        dataSource: [],
        images: [],
        imageid: null,
        visible: null,
      };
      this.columns = [
        {
          title: '名称',
          field: 'title',
        },
        {
          title: '镜像',
          field: 'image.desc',
          render: (value, i, item) => preact.html`<a onClick=${() => this.showImage(item)}>${value}</a>`,
        },
        {
          title: '镜像地址',
          field: 'image.url',
        },
      ];
    }

    showImage(item) {
      this.project = item;
      this.setState({
        imageid: item.image._id,
        visible: DialogType.MODIFY_IMAGE,
      });
    }

    onModifyImage() {
      if (this.state.imageid !== this.project.image._id) {
        $.ajax({
          url: '/projects',
          method: 'PATCH',
          data: JSON.stringify({
            projectid: this.project._id,
            imageid: this.state.imageid,
          }),
          success: () => {
            delete this.project;
            this.setState({
              imageid: null,
              visible: null,
            });
            this.refresh();
          },
        });
      }
    }

    refresh() {
      $.get('/projects',(data) => this.setState({ dataSource: data.data }));
      $.get('/images',(data) => this.setState({ images: data.data }));
    }

    componentDidMount() {
      this.refresh();
    }

    render(props, { dataSource, images, imageid, visible }) {
      return preact.html`
        <div>
          <${Table} columns=${this.columns} dataSource=${dataSource} />
          <${Dialog} visible=${visible === DialogType.MODIFY_IMAGE} title="修改镜像" onOk=${() => this.onModifyImage()}>
            <form class="sui-form form-horizontal">
              <div class="control-group">
                <div class="controls">
                  <ul role="menu" class="sui-dropdown-menu">
                    ${images.map(({ _id, desc }) => preact.html`<li class=${imageid === _id ? 'active' : ''}><a role="menuitem" tabindex="-1" onClick=${() => this.setState({ imageid: _id })}>${desc}</a></li>`)}
                  </ul>
                </div>
              </div>
            </form>
          <//>
        </div>
      `;
    }
  }

  return Projects;
});
