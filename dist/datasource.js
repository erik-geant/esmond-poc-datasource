'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GenericDatasource = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GenericDatasource = exports.GenericDatasource = function () {
    function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
        _classCallCheck(this, GenericDatasource);

        this.type = instanceSettings.type;
        var url = instanceSettings.url;
        if (url) {
            url = url.replace(/\/$/, '');
        }
        this.url = url;
        var key = instanceSettings.jsonData.measurementKey;
        if (key) {
            key = key.replace(/\/$/, '').replace(/^\//, '');
        }
        this.measurementKey = key;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.withCredentials = instanceSettings.withCredentials;
        this.headers = {
            'Content-Type': 'application/json'
        };
        if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
        }
    }

    // http://158.125.250.70/esmond/perfsonar/archive/010646242f574ca3b1d191d9b563ceb1/packet-count-sent/aggregations/3600

    // http://145.23.253.34/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/
    // http://145.23.253.34/esmond/perfsonar/archive/4187d2d6f4344491be2962b509c57f83/throughput/averages/86400

    _createClass(GenericDatasource, [{
        key: 'dataset',
        value: function dataset(target, response) {

            console.log("### handling dataset response");
            console.log("target");
            console.log(target);
            console.log("response");
            console.log(response);

            var data = [];
            _lodash2.default.each(response.data, function (p) {
                data.push([p.ts, p.value]);
            });
            return {
                target: target,
                datapoints: data
            };
        }
    }, {
        key: 'get_dataset',
        value: function get_dataset(options, target) {
            var _this = this;

            var backend_request = {
                withCredentials: this.withCredentials,
                headers: this.headers,
                url: this.url + target,
                method: 'GET'
            };
            console.log("*** get_dataset");
            console.log(backend_request);
            return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
                return _this.dataset(target, rsp);
            });
            //     
            //     
            //             backend_request).then(rsp => {
            //                 return RSLV(ds.dataset(target, rsp));
            //             })
            //         });
        }
    }, {
        key: 'query',
        value: function query(options) {
            var _this2 = this;

            console.log("query options***");
            console.log(options);

            var targets = _lodash2.default.filter(options.targets, function (t) {
                return !t.type || t.type == 'timeserie';
            });
            targets = targets.filter(function (t) {
                return !t.hide;
            });

            var _request_data = {
                range: options.range,
                interval: options.interval,
                format: "json",
                maxDataPoints: options.maxDataPoints,
                targets: _lodash2.default.map(targets, function (t) {
                    return t.target;
                })
            };
            if (targets === undefined || targets.length == 0) {
                return new Promise(function (res, rej) {
                    return res({
                        _request: { data: _request_data },
                        data: []
                    });
                });
            }

            //    if (this.templateSrv.getAdhocFilters) {
            //      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
            //    } else {
            //      query.adhocFilters = [];
            //    }

            var series_promises = _lodash2.default.map(targets, function (t) {
                return _this2.get_dataset(_request_data, t.target);
            });
            return Promise.all(series_promises).then(function (series_data) {
                return {
                    _request: { data: _request_data },
                    data: series_data
                };
            });
        }
    }, {
        key: 'testDatasource',
        value: function testDatasource() {
            var backend_request = {
                withCredentials: this.withCredentials,
                headers: this.headers,
                // HACK HACK: grafana removes 1 trailing slash & doesn't follow redirects
                //        url: this.url + "/esmond/perfsonar/archive/" + this.measurementKey + "//",
                url: this.url + "/esmond/perfsonar//",
                method: 'GET'
            };
            return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
                if (rsp.status === 200) {
                    return {
                        status: "success",
                        message: "Data source is working",
                        title: "Success"
                    };
                }
            });
        }
    }, {
        key: 'annotationQuery',
        value: function annotationQuery(options) {
            return Promise.resolve([]);
        }
    }, {
        key: 'metricFindQuery',
        value: function metricFindQuery(query) {
            var backend_request = {
                withCredentials: this.withCredentials,
                headers: this.headers,
                // HACK HACK: grafana removes 1 trailing slash & doesn't follow redirects
                //        url: this.url + "/esmond/perfsonar/archive/" + this.measurementKey + "//",
                url: this.url + "/esmond/perfsonar/archive//",
                method: 'GET'
            };
            return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
                if (rsp.status !== 200) {
                    return undefined;
                }
                var ts_types = ["throughput", "packet-count-sent", "packet-count-lost"];
                var metrics = [];
                _lodash2.default.each(rsp.data, function (m) {
                    _lodash2.default.each(m["event-types"], function (t) {
                        if (ts_types.includes(t["event-type"])) {
                            _lodash2.default.each(t.summaries, function (s) {
                                metrics.push({
                                    text: m.destination + ", " + t["event-type"] + " [" + s["summary-window"] + "]",
                                    value: s.uri
                                });
                            });
                        }
                    });
                });
                console.log(metrics);
                return metrics;
                //http://145.23.253.34/esmond/perfsonar/archive/
            });
        }
    }, {
        key: 'mapToTextValue',
        value: function mapToTextValue(result) {
            return _lodash2.default.map(result.data, function (d, i) {
                if (d && d.text && d.value) {
                    return { text: d.text, value: d.value };
                } else if (_lodash2.default.isObject(d)) {
                    return { text: d, value: i };
                }
                return { text: d, value: d };
            });
        }

        /*
          doRequest(options) {
            options.withCredentials = this.withCredentials;
            options.headers = this.headers;
        
            return this.backendSrv.datasourceRequest(options);
          }
        
          buildQueryParameters(options) {
            //remove placeholder targets
            options.targets = _.filter(options.targets, target => {
              return target.target !== 'select metric';
            });
        
            var targets = _.map(options.targets, target => {
              return {
                target: this.templateSrv.replace(target.target, options.scopedVars, 'regex'),
                refId: target.refId,
                hide: target.hide,
                type: target.type || 'timeserie'
              };
            });
        
            options.targets = targets;
        
            return options;
          }
        */

    }, {
        key: 'getTagKeys',
        value: function getTagKeys(options) {
            return Promise.resolve([]);
        }
    }, {
        key: 'getTagValues',
        value: function getTagValues(options) {
            return Promise.resolve([]);
        }
    }]);

    return GenericDatasource;
}();
//# sourceMappingURL=datasource.js.map
