/**
 * @file Defines the class CUI.ChatPresenter
 */

var CUI = CUI || {};

/**
 * Represents the chat UI and binds listeners to pre-existing DOM elements.
 * @class
 * @param {number} chatID           - A unique ID for the chat.
 * @param {string} historyUrl       - A url for loading a user's history.
 * @param {string} progressUrl      - A url for loading a user's progress.
 * @returns {CUI.ChatPresenter}
 */
CUI.ChatPresenter = function(chatID, historyUrl, progressUrl, resourcesUrl){
  /* When chat gets doWait parameter it should show messages only first time. This flag is about it.
   * @type {bool}
   * @protected
   */
  this._needShowMsg = true;

  /**
   * The chat's unique ID.
   * @type {number}
   * @protected
   */
  this._chatID = chatID;

  /**
   * An object with references to all messages, media, and breakpoints currently in the chat.
   * @type {Object.<number, CUI.ChatMessagePresenter|CUI.ChatMediaPresenter|CUI.ChatBreakpointPresenter>}
   * @protected
   */
  this._messages = {};

  /**
   * An array with references to all breakpoints currently in the sidebar.
   * @type {Array.<CUI.SidebarBreakpointPresenter>}
   * @protected
   */
  this._sidebarBreakpoints = {};

  /**
   * An array with references to all resources currently in the sidebar.
   * @type {Array.<CUI.SidebarBreakpointPresenter>}
   * @protected
   */
  this._sidebarResources = {};

  /**
   * The url for loading a user's chat history.
   * @type {string}
   * @protected
   */
  this._historyUrl = historyUrl;

  /**
   * The url for loading a user's chat progress.
   * @type {string}
   * @protected
   */
  this._progressUrl = progressUrl;

  /**
   * The url for loading a resources of the unit.
   * @type {string}
   * @protected
   */
  this._resourcesUrl = resourcesUrl;

  /**
   * The currently active input type in the chat. 'text', 'options', or 'custom'.
   * @type {string}
   * @protected
   */
  this._inputType = null;

  /**
   * The url for loading the next set of messages and input type.
   * @type {string}
   * @protected
   */
  this._inputUrl = null;

  /**
   * If input is enabled in the chat.
   * @type {boolean}
   * @protected
   */
  this._inputIsEnabled = false;

  /**
   * An array of existing input options.
   * @type {Array.<InputOptionPresenter>}
   * @protected
   */
  this._inputOptions = [];

  /**
   * The current set of message IDs that are searched for values when submitting input.
   * @type {Array.<number>}
   * @protected
   */
  this._includeSelectedValuesFromMessages = [];

  /**
   * True if the sidebar is visible.
   * @type {boolean}
   * @protected
   */
  this._isSidebarVisible = false;

  /**
   * A jQuery reference to the sidebar element.
   * @type {jQuery}
   * @protected
   */
  this._$sidebar = $('.chat-sidebar');

  /**
   * A jQuery reference to the container element for sidebar breakpoints.
   * @type {jQuery}
   * @protected
   */
  this._$sidebarBreakpointsContainer = $('.chat-sidebar-breakpoints');

  /**
   * A jQuery reference to the container element for sidebar breakpoints.
   * @type {jQuery}
   * @protected
   */
  this._$sidebarResourcesContainer = $('.chat-sidebar-resources');


  /**
   * A jQuery reference to the container element for sidebar breakpoints header.
   * @type {jQuery}
   * @protected
   */
  this._$sidebarResourcesHeaderContainer = $('.chat-sidebar-resources-header');


  /**
   * A jQuery reference to the container element for messages.
   * @type {jQuery}
   * @protected
   */
  this._$messagesContainer = $('.chat-messages');

  /**
   * A jQuery reference to the input bar.
   * @type {jQuery}
   * @protected
   */
  this._$inputBar = $('.chat-input-bar');

  /**
   * A jQuery reference to the container element for the various input types.
   * @type {jQuery}
   * @protected
   */
  this._$inputContainer = $('.chat-input');

  /**
   * A jQuery reference to the progress element.
   * @type {jQuery}
   * @protected
   */
  this._$progress = $('.chat-progress');

  /**
   * A jQuery reference to the sidebar toggle element.
   * @type {jQuery}
   * @protected
   */
  this._$sidebarToggle = $('.sidebar-toggle-b');

  /**
   * A jQuery reference to the fullscreen toggle element.
   * @type {jQuery}
   * @protected
   */
  this._$fullscreenToggle = $('.fullscreen-toggle');

  /**
   * A jQuery reference to the spinner element.
   * @type {jQuery}
   * @protected
   */
  this._$loading = $('.chat-loading');

  // Add event listeners
  this._addEventListeners();

  // Update fullscreen icon if fullscreen is active
  if(screenfull.isFullscreen) this._$fullscreenToggle.addClass('active');

  // Show chat
  this._showChat();

  return this;
};

/**
 * Loads a user's chat history and sends the response to {@link CUI.ChatPresenter#_parseHistory}.
 * @protected
 */
CUI.ChatPresenter.prototype._getHistory = function(){
  // Show spinner
  this._showLoading();
  this._getMessages(CUI.tree.start_node);
};

/**
 * Loads a user's next set of messages and input type.
 * @protected
 * @param {string} url     - A url for loading a user's next set of messages and input type.
 */
CUI.ChatPresenter.prototype._getMessages = function(url){
  // Get messages and input
  if (CUI.config.DEBUG) {
    console.log("CUI.ChatPresenter.prototype._getMessages ", url);
    console.log(CUI.tree.nodes[url]);
  }
  data = CUI.tree.nodes[url];
  if (data === undefined) {
    if (CUI.config.DEBUG) {
      console.log("FSM ENDED");
    }
    $.ajax({
      url: CUI.config.get_chat_status_url,
      method: 'GET',
      dataType: 'json',
      contentType: 'application/json',
      cache: false,
      context: this
    }).done(function(data){
      this._parseMessages(data, true);
    });
    return
  }
  if(data.input) this._setInput(data.input);
  else throw new Error("CUI.ChatPresenter._getMessages(): No data.input.");

    // Update chat with new messages
  if(data.addMessages) {
    // Post messages to the server
      $.ajax({
        url: CUI.config.historyUrl,
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(data.addMessages),
        cache: false,
        context: this
      }).done(function(response){
        this._parseMessages(data, true);
      });
    }
    else throw new Error("CUI.ChatPresenter._getMessages(): No data.addMessages.");
    // Hide spinner
    this._hideLoading();
};


CUI.ChatPresenter.prototype._sendGrade = function(grade){
  $.ajax({
    url: CUI.config.grading_url + "?score=" + grade,
    async: false,
    dataType: 'json',
    success: function(result) {
      console.log(result);
    }
  })
}

/**
 * Sends the user's input to the server.
 * @protected
 * @param {object} input     - An object containing the user's input.
 */
CUI.ChatPresenter.prototype._postInput = function(input){
  // Check that input is enabled
  if(!this._inputIsEnabled) return;

  // Disable input while validating and sending input
  this._inputIsEnabled = false;

  // Add selected elements to input
//  input.selected = this._findSelectedValues();
  input.chat_id = this._chatID;

  this._showLoading();

  // Send grades [grading, score]
  $.ajax({
    url: CUI.config.grading_url,
    method: 'PUT',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify(input),
    cache: false,
    context: this
  }).done(function(response){
      var msg_txt = '';
      var selected_option_model = undefined;
      if(input.option) {
        for (var i in this._inputOptions) {
          if (
            this._inputOptions[i]._model.value == input.option &&
            this._inputOptions[i]._model.text == input.text
          ) {
            selected_option_model = this._inputOptions[i]._model
            msg_txt = selected_option_model.text
            if (selected_option_model.bot) {
              if (CUI.config.DEBUG) {
                console.log("Selected OPtion Model = ", selected_option_model.bot);
              }
            }
            break;
          }
        }
      }

      // Show loading
      var message_model = new CUI.ChatMessageModel({
        html: msg_txt || input.text,
        id: Math.round(Math.random() * 100 * 100),
        userMessage: true
      })

      // show message in the chat
      this._addMessage(message_model);
      this._showLoading();

      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
      }

      var interval_min = CUI.config.interval_min;
      var interval_max = CUI.config.interval_max;
      var bot_interval_min = interval_min,
          bot_interval_max = interval_max;
      if (selected_option_model && selected_option_model.bot) {
        interval_max += 1000;
        interval_min += 1000;

        var bot = selected_option_model.bot;

        if (CUI.config.DEBUG) {
          console.log("BOT = ", bot);
          console.log("bot_interval_min = ", bot_interval_min);
          console.log("bot_interval_max = ", bot_interval_max);
        }

        window.setTimeout($.proxy(function(){
          if (bot.messages) {
            for (var i in bot.messages){
              this._addMessage(bot.messages[i], true);
            }
            // POST Adviser message to history chat
            $.ajax({
              url: CUI.config.historyUrl,
              method: 'PUT',
              dataType: 'json',
              contentType: 'application/json',
              data: JSON.stringify(bot.messages),
              cache: false,
              context: this
            }).done(function(response){
                if (CUI.config.DEBUG) {
                  console.log(response);
                };
            }).error(function(response){
                if (CUI.config.DEBUG) {
                  console.log("Sending bot msg to server fault!");
                }
            });
            if (bot.reanswering) {
              // console.log("BOT ", bot);
              this._setInput(bot.input);
              this._hideLoading();
            }
          }
        }, this), bot_interval_min, bot_interval_max)
      }

      if (!bot || !bot.reanswering) {
        window.setTimeout(
          $.proxy(function(){
            this._getMessages(this._inputUrl);
          }, this), getRandomInt(interval_min, interval_max)
        )
      }
  });

  if (CUI.config.DEBUG){
    console.log("CUI.ChatPresenter.prototype._postInput ", this._inputUrl);
  }

  if (input.option) {
    if (CUI.config.DEBUG){
      console.log("CUI.ChatPresenter.prototype._postInput CHANGING NODE FROM ", this._inputUrl, " ", input.option);
    }
    this._inputUrl = input.option
  }
}

/**
 * Passes text input onto to {@link ChatPresenter#_postInput}.
 * @protected
 */
CUI.ChatPresenter.prototype._postText = function(){
  // Create input object
  var input = {};

  // Find text
  var text = this._$inputContainer.find('.chat-input-text').find('textarea').val();
  // Add text to input object if set
  input.text = text;
  input.chat_id = this._chatID;

  this._postInput(input);
};

/**
 * Pass option input onto to {@link ChatPresenter#_postInput}.
 * @protected
 * @param {string} optionValue     - The selected option's value.
 */
CUI.ChatPresenter.prototype._postOption = function(optionValue, text, score, kc, weight){
  // Create input object
  var input = {option: optionValue, text: text, kc: kc };
  /**
   *
   *  MOVE this calculations to backend side, for security reason.
   *
   **/
  input.score = weight * score;
  // END MOVE

  input.chat_id = this._chatID;

  // Send input to server
  this._postInput(input);
};

/**
 * Sends a user's action to the server.
 * @protected
 * @param {string} actionUrl     - Where to fetch the next set of messages and input type.
 */
CUI.ChatPresenter.prototype._postAction = function(actionUrl){
  // Check that input is enabled
  if(!this._inputIsEnabled) return;

  // Disable input while validating and sending input
  this._inputIsEnabled = false;

  // Show loading
  this._showLoading();

  // Post input to server
  $.ajax({
    url: actionUrl,
    method: 'PUT',
    dataType: 'json',
    cache: false,
    context: this
  }).done(function(response){
    // Check that nextMessagesUrl is in response
    if(response && response.nextMessagesUrl){
        // Load next set of messages
        this._getMessages(response.nextMessagesUrl);
    }else{
      throw new Error('CUI.ChatPresenter._postAction(): No response.nextMessagesUrl');
    }
  }).fail(function(){
    // Enable input
    this._inputIsEnabled = true;

    // Hide spinner
    this._hideLoading();

    // Show message to try again
    this._showNotification(CUI.text.errorTryAgain);
  });
};

/**
 * Gets called when the history has loaded to initialize and show the chat.
 * @protected
 */
CUI.ChatPresenter.prototype._showChat = function(){
  // Fade out preloader
  var timeline = new TimelineMax();

  // Show chat
  this._$messagesContainer.show();
  // this._$sidebar.show();
  this._$inputBar.show();
  timeline.fromTo(this._$messagesContainer, 1.2, {opacity: 0}, {opacity: 1, ease: Power1.easeInOut, force3D: 'auto', clearProps: 'transform'});
  timeline.from(this._$inputBar, 0.7, {bottom: -85, ease: Power1.easeInOut, force3D: 'auto', clearProps: 'transform'}, 0.3);

  //Scroll to chat
  var top = this._$messagesContainer.offset().top;
  TweenLite.to(window, this._getScrollSpeed(top), {scrollTo: {y: top, autoKill: false}, ease: Power2.easeInOut, onComplete: $.proxy(function(){
    // Get message history
    this._getHistory();
  }, this)});
};

/**
 * Parses chat history data.
 * @protected
 * @param {Object} data                   - An object containing the user's history data and what input type to display.
 * @param {Object} data.input             - An object with settings for the input type.
 * @param {Array} data.addMessages        - An array with message objects that will be added to the chat.
 */
CUI.ChatPresenter.prototype._parseHistory = function(data){
  // Update the current input type in the chat
  if(data.input) this._setInput(data.input);
  else throw new Error("CUI.ChatPresenter._parseHistory(): No data.input.");

  // Update chat with new messages
  if(data.addMessages) this._parseMessages(data, false);
  else throw new Error("CUI.ChatPresenter._parseHistory(): No data.addMessages.");

  // Enable input
  this._hideLoading();
};

/**
 * Adds, updates, and removes messages in the chat.
 * @protected
 * @param {Object} data                   - An object containing messages and what input type do display.
 * @param {Array} data.addMessages        - An array with message objects that will be added to the chat.
 * @param {Array} [data.updateMessages]   - An array with message objects that will be updated in the chat.
 * @param {Array} [data.deleteMessages]   - An array of message ids for messages that will be removed from the chat.
 * @param {boolean} scrollTo              - Scrolls to first new message if true.
 */
CUI.ChatPresenter.prototype._parseMessages = function(data, scrollTo){
  var currentScrollTop = $(window).scrollTop();
  var newMessages = [];

  // Add new messages
  if(data.addMessages instanceof Array && data.addMessages.length > 0){
    $.each(data.addMessages, $.proxy(function(i, m){
      var model;

      // Create a model based on type
      if(m.type === 'message') model = new CUI.ChatMessageModel(m);
      else if(m.type === 'media') model = new CUI.ChatMediaModel(m);
      else if(m.type === 'breakpoint') model = new CUI.ChatBreakpointModel(m);
      else throw new Error("CUI.ChatPresenter._parseMessages(): Invalid m.type.");

      // Add message to chat
      newMessages.push(this._addMessage(model));
    }, this));
  }else{
    throw new Error("CUI.ChatPresenter._parseMessages(): No data.addMessages.");
  }

  // Update messages
  if(data.updateMessages instanceof Array && data.updateMessages.length > 0){
    $.each(data.updateMessages, $.proxy(function(i, m){
      var model;

      // Create a model based on type
      if(m.type === 'message') model = new CUI.ChatMessageModel(m);
      else if(m.type === 'media') model = new CUI.ChatMediaModel(m);
      else if(m.type === 'breakpoint') model = new CUI.ChatBreakpointModel(m);
      else throw new Error("CUI.ChatPresenter._parseMessages(): Invalid m.type.");

      //Update messages
      this._updateMessage(model);
    }, this));
  }

  // Delete messages
  if(data.deleteMessages instanceof Array && data.deleteMessages.length > 0){
    $.each(data.deleteMessages, $.proxy(function(i, id){
      this._removeMessage(id);
    }, this));
  }

  // Animate new messages
  TweenMax.from(newMessages, 0.7, {opacity: 0, scale: 0.9, ease: Power1.easeOut, force3D: true, clearProps: 'transform', onComplete: function(){
    // Draw equations after animation has completed
//    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  }});

  // Scroll to first new message
  if(scrollTo) this._scrollToMessage(data.addMessages[0].id);
};

/**
 * Creates and adds a message to the chat.
 * @protected
 * @param {ChatMessageModel|ChatMediaModel|ChatBreakpointModel} model   - The model for the message.
 * @param {ChatMessageModel|ChatMediaModel|ChatBreakpointModel} model   - The model for the message.
 * @returns {jQuery}
 */
CUI.ChatPresenter.prototype._addMessage = function(model){
  var message;

  // Create a message presenter based on model type
  if(model instanceof CUI.ChatMessageModel) message = new CUI.ChatMessagePresenter(model);
  else if(model instanceof CUI.ChatMediaModel) message = new CUI.ChatMediaPresenter(model);
  else if(model instanceof CUI.ChatBreakpointModel) message = new CUI.ChatBreakpointPresenter(model);
  else throw new Error("CUI.ChatPresenter._addMessage(): Invalid model.");

  // Save a reference to the message
  this._messages[model.id] = message;

  // Add message to chat
  this._$messagesContainer.append(message.$el);

  return message.$el;
};

/**
 * Updates a message in the chat.
 * @protected
 * @param {ChatMessageModel|ChatMediaModel|ChatBreakpointModel} model   - The new model for the message.
 */
CUI.ChatPresenter.prototype._updateMessage = function(model){
  var currentMessage;

  // Select existing message
  currentMessage = this._messages[model.id];

  // Update message
  if(currentMessage) currentMessage.update(model);
  else throw new Error('CUI.ChatPresenter._updateMessage(): Message with id "'+model.id+'" does not exist.');
};

/**
 * Removes a message from the chat.
 * @protected
 * @param {number} id       - The id of the message to remove.
 */
CUI.ChatPresenter.prototype._removeMessage = function(id){
  var currentMessage;
  var breakpoint;

  // Select existing message
  currentMessage = this._messages[id];

  // Check that message exists
  if(currentMessage){
    // Destroy message and remove reference
    currentMessage.destroy();
    this._messages[id] = null;

    // Remove any sidebar breakpoints linking to this message
    breakpoint = this._sidebarBreakpoints[id];

    if(breakpoint) breakpoint.destroy();
  }else{
    // Unneseccary to throw an error here
    // throw new Error('CUI.ChatPresenter._removeMessage(): Message with id "'+id+'" does not exist.');
  }
};

/**
 * Finds selected values within messages.
 * @protected
 * @returns {object}
 */
CUI.ChatPresenter.prototype._findSelectedValues = function(){
  var selected = {};

  // Loop through messages with selectables and look for selected elements
  $.each(this._includeSelectedValuesFromMessages, $.proxy(function(i, messageID){
    var $message;
    var $selectedSelectables;

    // Check that the message exists in the DOM
    if(this._messages[messageID]) {
      $message = this._messages[messageID].$el;

      // Find selected elements in message
      $selectedSelectables = $message.find('.chat-selectable.chat-selectable-selected, .chat-selectable:checked');

      // Add selected values to selected array
      if($selectedSelectables.length){
        $.each($selectedSelectables, function(ii, s){
          var attribute = $(s).data('selectable-attribute');
          var value = $(s).data('selectable-value');

          selected[messageID] = selected[messageID] || {};
          selected[messageID][attribute] = selected[messageID][attribute] || [];
          selected[messageID][attribute].push(value);
        });
      }
    }
  }, this));

  return selected;
};

/**
 * Hides input and displays a spinner.
 * @protected
 */
CUI.ChatPresenter.prototype._showLoading = function(){
  // Hide input
  TweenMax.set(this._$inputContainer, {opacity: 0, display: 'none', overwrite: 'all', force3D: 'auto', clearProps: 'transform'});

  // Fade in spinner
  TweenMax.fromTo(this._$loading, 0.5, {opacity: 0}, {opacity: 1, display: 'block', ease: Sine.easeInOut, force3D: 'auto', clearProps: 'transform'});

  // Animate dots in spinner
  if(!CUI.animation.chatLoadingTimeline) CUI.animation.chatLoadingTimeline = new TimelineMax().staggerTo(this._$loading.find('span'), 0.6, {y: -6, yoyo: true, repeat: -1, repeatDelay: 0.3, ease: Back.easeInOut,  force3D: true, clearProps: 'transform'}, 0.1);
  else CUI.animation.chatLoadingTimeline.play();
};

/**
 * Hides the spinner and displays input.
 * @protected
 */
CUI.ChatPresenter.prototype._hideLoading = function(){
  // Hide spinner
  TweenMax.set(this._$loading, {opacity: 0, display: 'none', overwrite: 'all', force3D: 'auto', clearProps: 'transform'});

  // Pause spinner dots animation
  CUI.animation.chatLoadingTimeline.pause();

  // Show input
  TweenMax.fromTo(this._$inputContainer, 0.5, {opacity: 0}, {opacity: 1, display: 'block', ease: Sine.easeInOut, force3D: 'auto', clearProps: 'transform', onComplete: $.proxy(function(){
      // Focus textarea if inputType is text
      if(this._inputType == 'text') this._$inputContainer.find('.chat-input-text').find('textarea').focus();
  }, this)});
};

/**
 * Toggles fullscreen.
 * @protected
 */
CUI.ChatPresenter.prototype._toggleFullscreen = function(){
  // Toggle fullscreen if allowed by browser
  if(screenfull.enabled){
   var scrollToPos = $(window).scrollTop();
   $(document).one(screenfull.raw.fullscreenchange, function() {
        $(window).scrollTop(scrollToPos);
    });
   screenfull.toggle();
   if(screenfull.isFullscreen) this._$fullscreenToggle.addClass('active');
   else this._$fullscreenToggle.removeClass('active');
  }else{
   this._showNotification(CUI.text.errorNoFullscreenSupport);
  }
};

/**
 * Displays a notification.
 * @protected
 * @param {string} text   - The text to display in the notification.
 */
CUI.ChatPresenter.prototype._showNotification = function(text){
  $.notify(text, {
    delay: 4000
  });
};

/**
 * Scrolls to a message in the chat.
 * @protected
 * @param {number} id   - The ID of the message to scroll to.
 */
CUI.ChatPresenter.prototype._scrollToMessage = function(id){
  var $message;
  var top;

  // Check that message exists
  if(this._messages[id]){
    $message = this._messages[id].$el;
    top = $message.offset().top - 14;
    TweenLite.to(window, this._getScrollSpeed(top), {scrollTo: top, ease: Power2.easeInOut});
  }
};

/**
 * Calculates the scroll animation time for window based on distance.
 * @protected
 * @param {number} scrollTo   - The new scroll position.
 * @returns {number}          - The animation time in seconds.
 */
CUI.ChatPresenter.prototype._getScrollSpeed = function(scrollTo){
  // Calculate distance
  var distance = Math.abs($(window).scrollTop() - scrollTo);
  var minSpeed = 1;
  var maxSpeed = 2;

  // Multiply distance with milliseconds
  var speed = (distance * 2) / 1000;

  // Make sure that speed is within the minSpeed - maxSpeed range
  speed = (speed < minSpeed) ? minSpeed : speed;
  speed = (speed > maxSpeed) ? maxSpeed : speed;

  return speed;
};


/**
 * Updates the input type visible in the chat.
 * @protected
 * @param {object} input          - An object with settings for the input type.
 */
CUI.ChatPresenter.prototype._setInput = function(input){
  var $text;
  var $options;
  var $custom;
  var $option;

  //Disable input
  this._inputIsEnabled = false;

  // Find containers for the various input types
  $text = this._$inputContainer.find('.chat-input-text');
  $options = this._$inputContainer.find('.chat-input-options');
  $custom = this._$inputContainer.find('.chat-input-custom');

  // Hide all input containers
  $text.hide();
  $options.hide();
  $custom.hide();

  // Empty dynamic content in input containers
  $custom.empty();
  if(this._inputOptions.length) $.each(this._inputOptions, function(i, io){
    io.destroy();
  });
  this._inputOptions = [];

  // Reset textarea size
  $text.find('textarea').val('').attr('rows', 1);

  // Create new input based on type
  if(input.doWait === true) {
   /*
   * Cycle is HERE!
   */
   this._runWaitTimer(input);
   return;
  }
  if(input.type === 'text'){
   // Set input type
   this._inputType = 'text';

   // Set input url
   if(input.url) this._inputUrl = input.url;
   else throw new Error('CUI.ChatPresenter._setInput(): No input.url.');

   // Show text input
   $text.show();
  } else if(input.type === 'options'){
   // Set input type
   this._inputType = 'options';

   // Set input url
   if(input.url) this._inputUrl = input.url;
   else throw new Error('CUI.ChatPresenter._setInput(): No input.url.');

   // Check that we have an options array
   if(!(input.options instanceof Array && input.options.length > 0)) throw new Error('CUI.ChatPresenter._setInput(): No input.options.');

   // Create a button for each option
   $.each(input.options, $.proxy(function(i, o){
     // Create a new input option
     o.kc = input.kc;
     var inputOption = new CUI.InputOptionPresenter(new CUI.InputOptionModel(o));
     this._inputOptions.push(inputOption);

     // Append input option
     $options.append(inputOption.$el);
   }, this));

   // Show input
   $options.show();
  }else if(input.type === 'custom'){
   // Set input type
   this._inputType = 'custom';

   // No input url for custom
   this._inputUrl = null;

   // Add custom HTML to input
   if(input.html){
     $custom.html(input.html);
   }else{
     throw new Error("CUI.ChatPresenter._setInput(): No input.html.");
   }

   // Show input
   $custom.show();
  }else{
   // Throw an error if type is missing or invalid
   throw new Error('CUI.ChatPresenter._setInput(): Invalid input.type');
  }

  // Set the array of ids for messages that contains selectable elements
  if(input.includeSelectedValuesFromMessages) this._includeSelectedValuesFromMessages = input.includeSelectedValuesFromMessages;
  else this._includeSelectedValuesFromMessages = [];

  // Enable input
  this._inputIsEnabled = true;
};

/**
 * Adds event listeners to the chat.
 * @protected
 */
CUI.ChatPresenter.prototype._addEventListeners = function(){
  // Sidebar toggle
  this._$sidebarToggle.on('click', $.proxy(function(e){
    e.preventDefault();
    $(e.currentTarget).toggleClass('active');

    this._toggleSidebar();
  }, this));


  // Sidebar toggle
    this._$sidebarToggle.one('resources', $.proxy(function(e){
      if(!this._isSidebarVisible){
        $(e.currentTarget).toggleClass('active');

        this._toggleSidebar();
      }
  }, this));


  // Fullscreen toggle
  this._$fullscreenToggle.on('click', $.proxy(function(e){
    e.preventDefault();
    this._toggleFullscreen();
  }, this));

  // Delegated event listeners for input options
  this._$inputContainer.find('.chat-input-options').on('click', '.chat-option', $.proxy(function(e){
    e.preventDefault();

    // Post input to server
    var inpt = $(e.currentTarget);
    this._postOption(
      inpt.data('option-value'),
      inpt.text(),
      inpt.data('option-score'),
      inpt.data('option-kc'),
      inpt.data('option-weight'),
      inpt.data('option-id')
    );
  }, this));

  // Delegated events for sidebar breakpoint links
  this._$sidebarBreakpointsContainer.on('click', 'li', $.proxy(function(e){
    e.preventDefault();

    // Scroll to message
    this._scrollToMessage($(e.currentTarget).data('href'));
  }, this));

  // Delegated events for sidebar resources links
  this._$sidebarResourcesContainer.on('click', 'li', $.proxy(function(e){
    e.preventDefault();

    // Scroll to message
    if ($.inArray('started', e.currentTarget.classList) > -1 ||
        $.inArray('unlocked', e.currentTarget.classList) > -1 ) {
    this._scrollToResourceMessage($(e.currentTarget).data('href'), $(e.currentTarget).data('ul'));
  }
  }, this));

  // Text input submit
  this._$inputContainer.find('#chat-input-text-form').on('submit', $.proxy(function(e){
    e.preventDefault();

    // Validate and post text to server
    this._postText();
  }, this)).on('keyup', $.proxy(function(e){
    // Submit form on ctrl-enter but ignore enter
    if(e.which === 13 && e.ctrlKey) {
      e.preventDefault();
      this._$inputContainer.find('#chat-input-text-form').submit();
    }
    if (e.which === 13) {
        // when user clicks on ENTER - we just put 2 new lines into inputContainer
        // but don't submit data to the server.
//        var $textarea = this._$inputContainer.find('textarea');
//        var value = $textarea.val();
//        var position = $textarea.getCursorPosition();
//        var new_val = value.slice(0, position) + "\r\n" + value.slice(position);
//        $textarea.val(new_val);
//        $textarea.selectRange(position+1);
//        $textarea.trigger({ type : 'keypress' });
    }
  }, this));

  // Overflow actions
  this._$messagesContainer.on('click', '.chat-actions li', $.proxy(function(e){
    e.preventDefault();

    // Hide actions
    $(e.currentTarget).closest('ul').stop().fadeToggle();

    // Post action
    var action = $(e.currentTarget).data('action');
    this._postAction(action);
  }, this));

  // Autoexpanding textarea for text input
  this._$inputContainer.find('.chat-input-text textarea').expandingTextarea({maxRows: 10});
};
