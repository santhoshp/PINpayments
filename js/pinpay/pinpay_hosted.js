var PinpayHosted = Class.create({

  /** Token generated by Card Token API */
  token: null,
  form: null,
  field_container: null,
  iframe: null,
  successCallback: null,

  /**
   *
   * @param config Config array to be passed to iframe
   * @param iframeUrl The URL of the iframe
   * @param successCallback An optional callback method that will be called instead of saving the payment method
   */
  initialize: function(config, iframeUrl, successCallback){
    this.form = $(config.form_element_id);
    this.field_container = $(config.hosted_fields_element_id);
    this.successCallback = successCallback;

    this.config = config;
    this.iframe = new Element('iframe',
        {
          'src': iframeUrl,
          'class': 'pin-iframe'
        });
    Event.observe(this.iframe, "load", this.handleIframeLoad.bind(this));
    Event.observe(window, 'message', this.receiveMessage.bind(this));
    this.field_container.insert(this.iframe);
  },

  handleIframeLoad: function() {
    var configMessage = {
      config: this.config
    };
    this.iframe.contentWindow.postMessage(JSON.stringify(configMessage), "*");
  },

  validatePinPayForm: function() {
    this.iframe.contentWindow.postMessage('set-token', "*");
    return false;
  },

  receiveMessage: function(e) {
    // Make sure we're only getting messages from PIN related sources.
    if (e.origin == "https://cdn.pin.net.au") {
      return;
    }
    // if the user presses the enter key in the iframe form,
    // we'll receive a 'submit' message here.
    if (e.data.lastIndexOf('submit', 0) === 0) {
      this.form.submit();
    } else {
      // messages other than 'submit' are card tokens.
      // populate the token field
      $(this.config.token_element).value = e.data;

      if(this.successCallback) {
        this.successCallback();
      } else {
        payment.save(true);
      }
    }
  }

});