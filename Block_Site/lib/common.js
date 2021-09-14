var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "extract": {
    "hostname": function (e) {
      var hostname = e;
      try {
        var tmp = new URL(e).hostname;
        if (tmp) hostname = tmp.replace("www.", '');
      } catch (e) {}
      /*  */
      return hostname;
    }
  },
  "load": function () {
    core.netrequest.register();
    /*  */
    app.contextmenu.create({
      "contexts": ["action"],
      "id": "block-site-test",
      "title": "Test Block Site"
    }, app.error);
    /*  */
    app.contextmenu.create({
      "contexts": ["page"],
      "id": "block-site-page",
      "title": "Block this domain"
    }, app.error);
  },
  "netrequest": {
    "register": async function () {
      await app.netrequest.display.badge.text(true);
      /*  */
      await app.netrequest.remove.action.type("block");
      await app.netrequest.remove.action.type("redirect");
      /*  */
      core.netrequest.add.rules(config.blocklist.domains, "main_frame");
      core.netrequest.add.rules(config.blocklist.iframes, "sub_frame");
      /*  */
      await app.netrequest.dynamic.rules.update();
    },
    "add": {
      "rules": function (list, type) {
        for (var domain in list) {
          var url = list[domain];
          domain = domain.replace("www.", '');
          /*  */
          if (url) {
            app.netrequest.dynamic.rules.add({
              "action": {
                "type": "redirect",
                "redirect": {"url": url}
              },
              "condition": {
                "resourceTypes": [type],
                "urlFilter": "*://" + domain + "/*"
              }
            });
            /*  */
            app.netrequest.dynamic.rules.add({
              "action": {
                "type": "redirect",
                "redirect": {"url": url}
              },
              "condition": {
                "resourceTypes": [type],
                "urlFilter": "*://www." + domain + "/*"
              }
            });
          } else {
            app.netrequest.dynamic.rules.add({
              "action": {"type": "block"},
              "condition": {
                "resourceTypes": [type],
                "urlFilter": "*://" + domain + "/*"
              }
            });
            /*  */
            app.netrequest.dynamic.rules.add({
              "action": {"type": "block"},
              "condition": {
                "resourceTypes": [type],
                "urlFilter": "*://www." + domain + "/*"
              }
            });
          }
        }
      }
    }
  }
};

app.storage.on.changed(async function () {
  await core.netrequest.register();
  /*  */
  app.options.send("update");
  if (config.log) console.error(">>", "webrequest observer is updated!");
});

app.contextmenu.on.clicked(function (e) {  
  if (e.menuItemId === "block-site-test") {
    app.tab.open(config.test.page);
  } else {
    if (e.pageUrl) {
      var tmp = config.blocklist.domains;
      var hostname = core.extract.hostname(e.pageUrl);
      if (hostname) {
        tmp[hostname] = null;
        config.blocklist.domains = tmp;
      }
      /*  */
      if (config.log) console.error(">>", "hostname", hostname, "blocklist", config.blocklist.domains);
      setTimeout(app.tab.reload, 300);
    }
  }
});

app.button.on.clicked(app.tab.options);

app.options.receive("test", function () {app.tab.open(config.test.page)});
app.options.receive("support", function () {app.tab.open(app.homepage())});
app.options.receive("blocklist", function (e) {config.blocklist.domains = e});
app.options.receive("notifications", function (e) {config.addon.notifications = e});
app.options.receive("blocklist-iframes", function (e) {config.blocklist.iframes = e});
app.options.receive("donation", function () {app.tab.open(app.homepage() + "?reason=support")});

app.on.startup(core.start);
app.on.installed(core.install);