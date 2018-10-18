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
        this.url = instanceSettings.url;
        this.measurementArchiveHostname = instanceSettings.jsonData.maHostname;
        this.name = instanceSettings.name;
        this.q = $q;
        this.backendSrv = backendSrv;
        this.templateSrv = templateSrv;
        this.withCredentials = instanceSettings.withCredentials;
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
            this.headers['Authorization'] = instanceSettings.basicAuth;
        }
    }

    // http://158.125.250.70/esmond/perfsonar/archive/010646242f574ca3b1d191d9b563ceb1/packet-count-sent/aggregations/3600
    // http://145.23.253.34/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/
    // http://145.23.253.34/esmond/perfsonar/archive/4187d2d6f4344491be2962b509c57f83/throughput/averages/86400
    //http://145.23.253.34/esmond/perfsonar/archive/

    _createClass(GenericDatasource, [{
        key: 'dataset',
        value: function dataset(target, response) {

            var data = [];
            _lodash2.default.each(response.data, function (p) {
                data.push([p.val, 1000 * p.ts]);
            });
            return {
                target: target,
                datapoints: data
            };
        }
    }, {
        key: 'get_dataset',
        value: function get_dataset(options, target) {

            var backend_request = {
                withCredentials: this.withCredentials,
                headers: this.headers,
                url: this.url + '/grafana/timeseries',
                method: 'POST',
                data: {
                    hostname: this.measurementArchiveHostname,
                    tsurl: target
                }
            };
            return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
                return {
                    target: target,
                    datapoints: rsp.data
                };
            });
        }
    }, {
        key: 'query',
        value: function query(options) {
            var _this = this;

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
                return _this.get_dataset(_request_data, t.target);
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
                url: this.url + '/grafana/version',
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
                url: this.url + "/grafana/metrics",
                method: 'POST',
                data: { hostname: this.measurementArchiveHostname }
            };
            return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
                if (rsp.status !== 200) {
                    return undefined;
                }
                return rsp.data;
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
