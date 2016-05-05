/**
 * Create view for viewport in builder layout
 * 
 * @type @exp;Backbone@pro;View@call;extend
 */
var BuilderViewportView = Backbone.View.extend(
    /** @lends BuilderMenuGroupsView.prototype */
    {
        id: "builder-viewport",
        deviceMode: "pc",
        previewMode: false,
        iframeLoaded: false,
        iframeLoadedFunctions: [],
        blocksCounter: 0,
        blockViews: [],
        /**
         * View menu
         * @class BuilderMenuView
         * @augments Backbone.View
         * @constructs
         */
        initialize: function(options) {
            this.controller = options.controller;
            this.storage = options.storage;
            this.model.on("block_add", this.addBlock.bind(this));
            // builder.on('start_edit_block', this.onEditStart.bind(this));
            // builder.on('stop_edit_block', this.onEditStop.bind(this));
        },
        getDefaultTemplateAdapter: function() {
            return 'hbs';
        },
        /**
         * Render menu
         * @returns {Object}
         */
        render: function() {
            this.$el.html(_.template(this.storage.builderTemplates['builder-viewport'])({ "postId": this.storage.pageId }));
            return this;
        },

        /**
         * Shows edit buttons, shadowing other blocks
         * @param {integer} blockId
         */
        startEditBlock: function(blockId) {
            var iframe = this.getWindowIframe();
            iframe.jQuery('.overlay').removeClass('active').addClass('no-active');
            iframe.jQuery('#outer-block-' + blockId).find('.overlay').removeClass('no-active').addClass('active');
        },
        stopEditBlock: function() {
            var iframe = this.getWindowIframe();
            iframe.jQuery('.overlay').removeClass('active').removeClass('no-active');

        },
        setPreviewMode: function() {
            this.previewMode = true;
            this.getIframeContents().find('#builder-blocks').addClass('preview');
        },
        setEditMode: function() {
            this.previewMode = false;
            this.getIframeContents().find('#builder-blocks').removeClass('preview');
        },
        setDeviceMode: function(mode) {
            this.deviceMode = mode;
            var size = {
                'pc': {
                    'width': '100%'
                },
                'tablet-vertical': {
                    'width': '768px'
                },
                'phone-vertical': {
                    'width': '375px'
                },
                'tablet-horizontal': {
                    'width': '1024px'
                },
                'phone-horizontal': {
                    'width': '667px'
                }
            };
            this.getIframe().stop().animate(size[mode]);
        },
        /**
         * Resize builder content
         */
        resize: function() {
            var size = {
                'height': (this.previewMode ? 0 : 70),
                'width': (this.previewMode ? 0 : 258)
            };

            this.$el.stop().animate({
                height: jQuery(window).height() - size.height,
                top: size.height,
                width: jQuery(window).width() - size.width,
                left: size.width
            });

            //Iframe resize
            this.getIframe().height(jQuery(window).height() - size.height);
            if (this.deviceMode == "pc") {
                this.getIframe().width("100%");
            }
        },
        scrollTo: function(blockId) {
            //Scroll to new block
            this.getWindowIframe().jQuery('body').animate({
                scrollTop: this.getBlockView(blockId).$el.offset().top
            }, 1000);

        },
        onLoad: function(func) {
            if (this.iframeLoaded) {
                func();
            } else {
                this.iframeLoadedFunctions.push(func);
            }
        },
        triggerLoad: function() {
            this.iframeLoaded = true;
            while (this.iframeLoadedFunctions.length > 0) {
                this.iframeLoadedFunctions.shift()();
            }
        },
        /**
         * Devices settings
         * @returns object field devices
         */
        devicesSettings: function() {
            return {
                "name": "devices",
                "label": "Visible Devices",
                "type": "devices",
                "settings": [{
                    "name": "desktop",
                    "label": "Desktop"
                }, {
                    "name": "tablet",
                    "label": "Tablet"
                }, {
                    "name": "mobile",
                    "label": "Mobile"
                }],
                "default": ""
            }
        },
        /**
         * Get BlockView by id
         * @param {Number} id modelId
         */
        getBlockView: function(id) {
            for (var i = 0; i < this.blockViews.length; i++) {
                if (this.blockViews[i].model.id == id) {
                    return this.blockViews[i];
                }
            };
        },
        /**
         * Remove BlockView by id
         * @param {Number} id modelId
         */
        delBlockView: function(id) {
            this.blockViews = this.blockViews.filter(function(item) {
                if (item.model.id === id) {
                    item.dispose();
                    //FIXME: why false?
                    return false;
                }
                return true;
            });
        },
        /**
         * Add block
         * 
         * @param {Object} block
         * @param {integer} afterBlockId
         */
        addBlock: function(model, beforeBlockId) {
            var self = this;
            var iframe = this.getWindowIframe();

            var blockWrapper = new BlockWrapperView({
                model: model,
                storage: this.storage,
                controller: this.controller
            });

            this.blockViews.push(blockWrapper);

            //If event 'blocks_loaded' have not been triggered
            if (this.blocksCounter !== null) {
                this.blocksCounter++;
                blockWrapper.once('loaded', function() {
                    self.blocksCounter--;
                    if (self.blocksCounter === 0) {
                        self.trigger('blocks_loaded');
                        self.blocksCounter = null;
                    }
                });
            }

            //Attach element to DOM
            if (beforeBlockId > 0) {
                iframe.jQuery('#outer-block-' + beforeBlockId).before(blockWrapper.render().el);
            } else {
                iframe.jQuery('#droppable-0').before(blockWrapper.render().el);
            }


            // default visible block
            // if (blockView.model.get('devices')) {
            //     this.visibilityBlocks(blockView.model.id, blockView.model.get('devices').split(','));
            // }

            // setting block height
            //            builder.builderLayout.menu.resize();

            // Trigger change
            //            this.triggerBuilderBlock();
        },

        /**
         * Create event change for iframe
         * @returns {Event} change
         */
        triggerBuilderBlock: function() {
            // Trigger change builder blocks for theme
            var iframe = this.getWindowIframe();
            iframe.jQuery('#builder-blocks').trigger('change');
        },

        /**
         * Remove block by id
         * 
         * @param {Integer} blockId
         */
        removeBlock: function(blockId) {
            var alert = confirm("Are you sure you want to delete the block?");
            if (!alert) {
                return false;
            }

            var iframe = this.getWindowIframe();

            // add class when delete block
            iframe.jQuery('div[data-model-id="' + blockId + '"]').addClass('content-hide');

            // remove from storage and DOM
            builder.storage.delModel(blockId);
            builder.storage.delBlockView(blockId);
            builder.storage.delSettingsView(blockId);

            // remove container block
            setTimeout(function() {
                iframe.jQuery('div[data-model-id="' + blockId + '"]').remove();
            }, 1000);

            builder.trigger('stop_edit_block');
        },
        /**
         * Create droppable event by id
         * 
         * @param {integer} blockId
         */
        droppable: function(blockId) {
            var iframe = this.getIframeContents();
            var self = this;
            iframe.find('#droppable-' + blockId).droppable({
                activeClass: "ui-droppable-active",
                hoverClass: "ui-droppable-hover",
                tolerance: "pointer",
                drop: function(event, ui) {
                    var dropElement = jQuery(this);
                    //get template id
                    var templateId = ui.draggable.attr("id").replace("preview-block-", "");
                    //get after id
                    var beforeId = dropElement.attr("id").replace("droppable-", "");
                    // add new block
                    self.controller.addNewBlock(templateId, beforeId);
                }
            });
        },
        /**
         * Create default droppable in iframe
         */
        createDefaultDroppable: function() {
            var iframe = this.getWindowIframe();
            var droppable = _.template(this.storage.builderTemplates['block-droppable'])({ "blockId": 0 });
            iframe.jQuery('#builder-blocks').append(iframe.jQuery(droppable));
            this.droppable('0');
        },



        getIframe: function() {
            return this.$el.find('#builder-iframe');
        },
        /**
         * Get iframe contents
         * @returns {DOMElement}
         */
        getIframeContents: function() {
            return this.getIframe().contents();
        },
        /**
         * Get iframe documnet
         * @returns {DOMElement}
         */
        getWindowIframe: function() {
            return window.frames["builder-iframe"];
        },
        /**
         * Change devices display
         */
        visibilityBlocks: function(blockId, devices) {
            var iframe = this.getIframeContents();

            var block = iframe.find("[data-model-id='" + blockId + "']");

            block.removeClass(function(index, classes) {
                var regex = /^visible-/;
                return classes.split(/\s+/).filter(function(c) {
                    return regex.test(c);
                }).join(' ');
            });

            for (var i = 0; i < devices.length; i++) {
                block.addClass('visible-' + devices[i]);
            }
        }
    });
