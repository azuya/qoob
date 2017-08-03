/**
 * Create view for toolbar in qoob layout
 *
 * @type @exp;Backbone@pro;View@call;extend
 */

var QoobToolbarView = Backbone.View.extend({ // eslint-disable-line no-unused-vars
    /** @lends QoobToolbarView.prototype */
    tagName: 'div',
    customMenu: null,
    events: {
        'click .view-preview': 'clickPreviewMode',
        'change .lib-select': 'changeLib',
        'change .preview-modes': 'changeDeviceMode',
        // 'click .exit': 'clickExit',
        'click .save': 'clickSave',
        'click .autosave-checkbox': 'clickAutosave',
        'click [data-id]': 'clickAction'
    },
    attributes: function() {
        return {
            id: "qoob-toolbar"
        };
    },
    /**
     * View toolbar
     * @class QoobToolbarView
     * @augments Backbone.View
     * @constructs
     */
    initialize: function(options) {
        this.storage = options.storage;
        this.controller = options.controller;
    },
    /**
     * Start action custom menu
     * @param {Object} evt
     */
    clickAction: function(evt) {
        evt.preventDefault();
        var id = jQuery(evt.currentTarget).data("id");

        if (typeof this.storage.driver.mainMenu === "function") {
            var menuItem = this.customMenu.find(function(o) {
                return o.id === id;
            });

            if (menuItem.action) {
                menuItem.action(this);
            }
        }
    },
    /**
     * Render toolbar
     * @returns {Object}
     */
    render: function() {
        var self = this;
        var data = {
            "libs": this.storage.librariesData,
            "curLib": this.storage.currentLib,
            "allThemes": this.storage.__('all_libs', 'All Libs'),
            "save": this.storage.__('save', 'Save'),
            "close": this.storage.__('close', 'close'),
            "more": this.storage.__('more', 'More'),
            "desktop": this.storage.__('desktop', 'Desktop'),
            "tablet": this.storage.__('tablet', 'Tablet'),
            "phone": this.storage.__('phone', 'Phone'),
            "save_template": this.storage.__('save_template', 'Save as template'),
            "autosave": this.storage.__('autosave', 'Autosave'),
            "customMenu": null
        };

        if (typeof this.storage.driver.mainMenu === "function") {
            var staticCustomMenu = [{
                "id": "import-export",
                "label": "Import/export",
                "action": function() { self.controller.showImportExportWindow() },
                "icon": ""
            }, {
                "id": "empty-page",
                "label": "Empty page",
                "action": function() { self.controller.removePageData() },
                "icon": ""
            }];
            data.customMenu = this.customMenu = this.storage.driver.mainMenu(staticCustomMenu);
        }

        this.$el.html(_.template(this.storage.getSkinTemplate('qoob-toolbar-preview'))(data));

        // Init select
        this.$el.find('.qoob-select-item').qoobSelect();

        return this;
    },
    /**
     * Show loader autosave
     */
    showSaveLoader: function() {
        this.$el.find('.save span.text').hide();
        this.$el.find('.save .clock').css('display', 'block');
    },
    /**
     * Hide loader autosave
     */
    hideSaveLoader: function() {
        this.$el.find('.save .clock').css('display', '');
        this.$el.find('.save span.text').show();
    },

    //EVENTS
    clickPreviewMode: function() {
        this.controller.setPreviewMode();
    },
    changeDeviceMode: function(evt) {
        this.controller.setDeviceMode(evt.target.value);
    },
    // deprecated
    clickExit: function() {
        this.controller.exit();
    },
    clickSave: function() {
        this.controller.save();
    },
    clickAutosave: function(evt) {
        this.controller.setAutoSave(evt.target.checked);
    },
    changeLib: function(evt) {
        this.controller.changeLib(evt.target.value);
    }
});