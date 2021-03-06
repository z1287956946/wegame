var PeriodPanel;
var lottery;
var pageMap;
var tableId;
if (!PeriodPanel) {
    $.ajaxSetup({
        cache: false
    });
    function showTime(a, b) {
        if (a && a.length > 0) {
            a.text(LIBS.timeToString(b))
        }
    }
    function fillCDPanel(b, a) {
        var c = a + "Panel";
        if (b[a] == null && b[c] != null) {
            b[a] = b[c].children("span")
        } else {
            if (b[c] == null && b[a] != null) {
                b[c] = b[a].parent()
            }
        }
    }
    function checkEmpty(d, c) {
        for (var b = 0; b < c.length; b++) {
            var a = c[b];
            if (d[a] && d[a].length === 0) {
                d[a] = null
            }
        }
    }
    function bindComplete(c, b) {
        var a = b.complete;
        b.complete = function() {
            if (c.refreshRemain <= 0) {
                c.refreshRemain = c.interval;
                c.showRefreshRemain()
            }
            if (a) {
                a.apply(this, arguments)
            }
        };
        return b
    }
    var NUM_CONV = "一二三四五六七八九十".split("");
    function clearChanglongTitle(b) {
        if (b.indexOf("冠亚") == 0 && b.indexOf("-") == -1) {
            b = b.replace("冠亚", "冠亚军和 - ")
        } else {
            b = b.replace("-", " - ");
            for (var a = 0; a < NUM_CONV.length; a++) {
                b = b.replace(NUM_CONV[a], a + 1)
            }
        }
        return b
    }
    PeriodPanel = (function() {
        return {
            timeOffset: 0,
            timer: null,
            interval: 90,
            refreshRemain: -1,
            titleConverter: clearChanglongTitle,
            loadOptions: null,
            loadingState: null,
            changlong: null,
            drawPanel: null,
            lastResult: null,
            resultTimer: null,
            resultInterval: 6000,
            accountTimer: null,
            accountInterval: 30000,
            countdownText: "{0}秒",
            countdownPanel: null,
            drawNumberText: null,
            drawNumberPanel: null,
            showLoading: null,
            cdOpenPanel: null,
            cdClosePanel: null,
            cdDrawPanel: null,
            cdOpen: null,
            cdClose: null,
            cdDraw: null,
            periodShowType: 0,
            refreshFlag: -1000,
            onResultChange: null,
            onPeriodChange: null,
            onLoadData: null,
            onAccountUpdated: null,
            onChangLongClick: null,
            now: function(a) {
                if (a) {
                    return (new Date()).getTime()
                }
                return (new Date()).getTime() - this.timeOffset
            },
            settingTime: function(a) {
                a = Number(a);
                if (isNaN(a)) {
                    return
                }
                this.timeOffset = this.now(true) - a
            },
            init: function(b, d) {
                tableId = LIBS.getUrlParam("tableId");
                LIBS.clone(this, b);
                fillCDPanel(this, "cdOpen");
                fillCDPanel(this, "cdClose");
                fillCDPanel(this, "cdDraw");
                if (!this.drawPanel) {
                    this.drawPanel = $("#drawInfo")
                }
                if (!this.countdownPanel) {
                    this.countdownPanel = $("#cdRefresh")
                }
                if (!this.drawNumberPanel) {
                    this.drawNumberPanel = $("#drawNumber")
                }
                if (d) {
                    $("#gameName").text(d)
                }
                checkEmpty(this, ["cdOpen", "cdOpenPanel", "cdClose", "cdClosePanel", "cdDraw", "cdRefresh", "cdDrawPanel", "drawPanel", "countdownPanel", "drawNumberPanel", "changlong"]);
                var c = this;
                LIBS.get("pc.php?c=pc&a=time",
                    function(e) {
                        c.settingTime(e)
                    });
                this.timer = setInterval(function() {
                        if (c.period) {
                            c.showPeriod()
                        }
                        c.doInterval()
                    },
                    1000);
                var a = $("#refreshInteval");
                if (a.length > 0) {
                    a.change(function() {
                        c.changeInterval($(this).val())
                    });
                    this.changeInterval(a.val())
                }
                if (this.loadOptions && !$.isFunction(this.loadOptions)) {
                    bindComplete(this, this.loadOptions)
                }
                this.reload()
            },
            reload: function(a) {
                if (this.loadingState) {
                    return
                }
                if (a) {
                    if ($.isFunction(this.showLoading)) {
                        this.showLoading()
                    } else {
                        this.showRefreshRemain(0)
                    }
                }
                var b = this;
                this.loadingState = $.ajax({
                    url: "/pc.php?c=pc&a=period",
                    data: {
                        lottery: lottery,
                        tableId: tableId
                    },
                    success: function(d) {
                        b.loadingState = null;
                        try {
                            d = JSON.parse(d);
                            b.changePeriod(d)
                        } catch(c) {
                            alert("loading period:" + c.message)
                        }
                    },
                    complete: function() {
                        if (b.refreshRemain <= 0) {
                            b.refreshRemain = b.interval;
                            b.showRefreshRemain()
                        }
                    }
                })
            },
            changePeriod: function(d) {
                if (d && d.openTime - this.now() > 65000) {
                    d = null
                }
                if (d) {
                    var c = this.now();
                    var b = d.status;
                    d.rstatus = b;
                    if (d.openTime <= c && b < 1) {
                        d.status = 1
                    }
                    if (d.closeTime <= c && b < 2) {
                        d.status = 2
                    }
                }
                var a = this.period;
                this.period = d;
                if (a === undefined || ( !! a) != ( !! d) || (d && (d.drawNumber != a.drawNumber || d.status != a.status))) {
                    if ($.isFunction(this.onPeriodChange)) {
                        if (this.onPeriodChange(d, a) === false) {
                            return
                        }
                    }
                    this.loadResult()
                }
                if (d) {
                    this.reloadData()
                }
                this.showPeriod()
            },
            reloadData: function() {
                if (this.loadingState) {
                    return
                }
                if (this.loadOptions) {
                    var a = this.loadOptions;
                    if ($.isFunction(a)) {
                        a = a()
                    }
                    if (a) {
                        LIBS.ajax(a)
                    }
                }
                if ($.isFunction(this.onLoadData)) {
                    this.onLoadData(this)
                }
            },
            reloadDataDelay: function(a) {
                if (!a) {
                    a = 3000
                }
                var b = this;
                setTimeout(function() {
                        b.reloadData()
                    },
                    a)
            },
            changeInterval: function(a) {
                this.interval = a;
                this.refreshRemain = a;
                if (a > 0) {
                    this.showRefreshRemain()
                }
            },
            showRefreshRemain: function(b) {
                if (b === undefined) {
                    b = this.refreshRemain
                }
                if (b >= 0) {
                    if ($.isFunction(this.countdownText)) {
                        this.countdownText(b);
                        return
                    } else {
                        if (this.countdownPanel) {
                            if (b == 0) {
                                this.countdownPanel.html("<span>载入中…</span>")
                            } else {
                                var a = b;
                                if (this.countdownText) {
                                    a = this.countdownText.format(a)
                                }
                                this.countdownPanel.text(a)
                            }
                        }
                    }
                }
            },
            doInterval: function() {
                if (this.refreshRemain <= 0) {
                    return
                }
                this.refreshRemain -= 1;
                this.showRefreshRemain();
                if (this.refreshRemain <= 0) {
                    this.reload(true)
                }
            },
            showPeriod: function() {
                var g = this.period;

                if (!g) {
                    if (this.drawNumberPanel) {
                        this.drawNumberPanel.text("")
                    }
                    showTime(this.cdOpen, 0);
                    showTime(this.cdClose, 0);
                    showTime(this.cdDraw, 0)
                } else {
                    if (this.drawNumberPanel) {
                        var d = g.drawNumber;
                        if (this.drawNumberText) {
                            d = this.drawNumberText.format(d)
                        }
                        this.drawNumberPanel.text(d)
                    }
                    var e = this.now();
                    var c = g.openTime - e;
                    var f = g.closeTime - e;
                    var a = g.drawTime - e;
                    showTime(this.cdOpen, c);
                    showTime(this.cdClose, f);
                    showTime(this.cdDraw, a);
                    if (this.periodShowType == 0 && this.cdOpenPanel) {
                        if (c > 0) {
                            this.cdOpenPanel.show();
                            this.cdClosePanel.hide()
                        } else {
                            this.cdOpenPanel.hide();
                            this.cdClosePanel.show()
                        }
                    } else {
                        if (this.periodShowType == 1) {
                            if (c > 0) {
                                this.cdOpenPanel.show();
                                this.cdClosePanel.hide();
                                this.cdDrawPanel.hide()
                            } else {
                                if (f > 0) {
                                    this.cdOpenPanel.hide();
                                    this.cdClosePanel.show();
                                    this.cdDrawPanel.hide()
                                } else {
                                    this.cdOpenPanel.hide();
                                    this.cdClosePanel.hide();
                                    this.cdDrawPanel.show()
                                }
                            }
                        }
                    }
                    var b = g.status;
                    if ((c <= this.refreshFlag && b < 1) || (f <= this.refreshFlag && b < 2) || (a <= this.refreshFlag)) {
                        this.reload()
                    }
                }
            },
            loadResult: function() {
                var a = this;
                LIBS.ajax({
                    url: "/pc.php?c=pc&a=lastresult",
                    data: {
                        lottery: lottery,
                        table: tableId
                    },
                    success: function(c) {
                        //c = JSON.parse(c);

                        if (c) {
                            a.showResult(c);
                            var d = a.period;
                            var b = c.drawNumber;
                            if (d && b != d.drawNumber && b != d.pnumber) {
                                clearTimeout(a.resultTimer);
                                a.resultTimer = setTimeout(function() {
                                        a.loadResult()
                                    },
                                    a.resultInterval)
                            }
                        }
                    }
                })
            },
            showResult: function(a) { //长龙
                a = JSON.parse(a);
                var o = this.lastResult;
                if (o == null || o.drawNumber != a.drawNumber || o.result != a.result) {
                    this.loadAccounts();
                    if ($.isFunction(this.onResultChange)) {
                        this.onResultChange(a)
                    }
                }
                this.lastResult = a;
                if (this.drawPanel) {
                    this.drawPanel.find(".draw_number").html(a.drawNumber + "<span>期开奖</span>");
                    var b = this.drawPanel.find(".balls");
                    b.empty();
                    var g = a.result.split(",");
                    var f;
                    if (template == "hk6") {
                        f = get_animal_by_ball
                    } else {
                        if (template == "3D") {
                            f = function(p, r) {
                                return ["佰", "拾", "个"][r]
                            }
                        }
                    }
                    for (var h = 0; h < g.length; h++) {
                        var e = g[h];
                        var d = $("<li>").appendTo(b);
                        d.append($("<b>").addClass("b" + e).text(e));
                        if (f) {
                            d.append($("<i>").text(f(e, h)))
                        }
                        if (template == "hk6") {
                            if (h == 5) {
                                $("<li>").addClass("plus").text("+").appendTo(b)
                            }
                        }
                    }
                } else {
                    if (parent && parent.showResult) {
                        parent.showResult(a)
                    }
                }
                var n = this.changlong;
                if (!this.changlong) {
                    return
                }
                n.empty();
                if (a.detail && n.length) {
                    var u = a.detail.split(";");
                    var j = [];
                    for (var h = 0; h < u.length; h++) {
                        var s = u[h];
                        if (!s) {
                            continue
                        }
                        var k = s.split(",");
                        if (/\d$/.test(k[0])) {
                            continue
                        }
                        j.push([k[1], this.titleConverter ? this.titleConverter(k[2]) : k[2], k[0].replace("=", "_")])
                    }
                    j.sort(function(p, i) {
                        var r = i[0] - p[0];
                        if (r != 0) {
                            return r
                        }
                        return p[1].localeCompare(i[1])
                    });
                    function m(r) {
                        if (pageMap) {
                            var p = pageMap[template];
                            if (!p) {
                                return
                            }
                            for (var i in p) {
                                if (i == "") {
                                    continue
                                }
                                if (r.indexOf(i) === 0) {
                                    return p[i]
                                }
                            }
                            return p[""]
                        }
                    }
                    var q = this;
                    for (var h = 0; h < j.length; h++) {
                        var k = j[h];
                        var l = m(k[1]);
                        var c = $("<th>");
                        if (l) {
                            $("<a>").text(k[1]).attr("href", "pc.php?c=pc&a=lottery&lottery=" + lottery + "&page=" + l + "#" + k[2]).click(function() {
                                if (q.onChangLongClick) {
                                    var p = $(this).attr("href");
                                    var i = p.lastIndexOf("#");
                                    return q.onChangLongClick(p.substr(i + 1), p.substr(0, i))
                                }
                            }).appendTo(c)
                        } else {
                            c.text(k[1])
                        }
                        $("<tr>").append(c).append($("<td>").text(k[0] + " 期")).appendTo(n)
                    }
                }
            },
            loadAccounts: function() {
                var a = this;
                clearTimeout(this.accountTimer);
                LIBS.ajax({
                    url: "pc.php?c=pc&a=account",
                    success: function(b) {
                        b = JSON.parse(b);
                        //console.log(b);
                        if (b) {
                            a.showAccount(b)
                        }
                    }
                });
                this.accountTimer = setTimeout(function() {
                        a.loadAccounts()
                    },
                    this.accountInterval)
            },
            showAccount: function(a) {
                $("#bresult").text(LIBS.round(a.result || 0, 1));
                if ($.isFunction(this.onAccountUpdated)) {
                    this.onAccountUpdated(a)
                }
            }
        }
    })();
    if (typeof window.IS_MOBILE != "undefined") {
        PeriodPanel.showPeriod = (function() {
            var g = this.period;

            this.cdOpenPanel = $(".openPanel");
            this.cdClosePanel = $(".closePanel");
            if (!g) {
                if (this.drawNumberPanel) {
                    this.drawNumberPanel.text("")
                }
                showTime(this.cdOpen, 0);
                showTime(this.cdClose, 0);
                showTime(this.cdDraw, 0)
            } else {
                if (this.drawNumberPanel) {
                    var d = g.drawNumber;
                    if (this.drawNumberText) {
                        d = this.drawNumberText.format(d)
                    }
                    this.drawNumberPanel.text(d)
                }
                var e = this.now();
                var c = g.openTime - e;
                var f = g.closeTime - e;
                var a = g.drawTime - e;
                showTime(this.cdOpen, c);
                showTime(this.cdClose, f);
                showTime(this.cdDraw, a);
                if (LIBS.timeToString(f) == "00:00") {
                    this.cdOpenPanel.hide();
                    this.cdClosePanel.show()
                } else {
                    this.cdOpenPanel.show();
                    this.cdClosePanel.hide()
                }
                var b = g.status;
                if ((c <= this.refreshFlag && b < 1) || (f <= this.refreshFlag && b < 2) || (a <= this.refreshFlag)) {
                    this.reload()
                }
            }
        });
        PeriodPanel.showRefreshRemain = (function(b) {
            if (b === undefined) {
                b = this.refreshRemain
            }
            if (b >= 0) {
                if ($.isFunction(this.countdownText)) {
                    this.countdownText(b);
                    return
                } else {
                    if (this.countdownPanel) {
                        if (b == 0) {
                            this.countdownPanel.html("<span>载入</span>")
                        } else {
                            var a = b;
                            if (this.countdownText) {
                                a = this.countdownText.format(a)
                            }
                            this.countdownPanel.text(a)
                        }
                    }
                }
            }
        })
    }
};