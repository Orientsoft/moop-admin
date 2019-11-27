define(['preact'], function (preact) {
  class Dialog extends preact.Component {
    setRef(ref) {
      this.ref = ref;
      if (this.ref) {
        const dialog = $(this.ref);

        dialog.on('okHide', () => this.props.onOk && this.props.onOk());
        dialog.on('cancelHide', () => this.props.onClose && this.props.onClose());
      }
    }

    componentWillReceiveProps(nextProps) {
      $(this.ref).modal(nextProps.visible ? 'show' : 'hide');
    }

    render({ title, children }) {
      return preact.html`
        <div ref=${ref => this.setRef(ref)} tabindex="-1" role="dialog" class="sui-modal hide fade">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" data-dismiss="modal" aria-hidden="true" class="sui-close">×</button>
                <h4 class="modal-title">${title}</h4>
              </div>
              <div class="modal-body">${children}</div>
              <div class="modal-footer">
                <button type="button" data-ok="modal" class="sui-btn btn-primary btn-large">确定</button>
                <button type="button" data-dismiss="modal" class="sui-btn btn-default btn-large">取消</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  return Dialog;
});
