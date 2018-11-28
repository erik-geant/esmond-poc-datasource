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
    value: function get_dataset(options, name, target, metric) {

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
      if (metric) {
        backend_request.data.metric = metric;
      }
      return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
        return {
          target: name,
          datapoints: rsp.data
        };
      });
    }
  }, {
    key: 'query',
    value: function query(options) {
      var _this = this;

      var targets = _lodash2.default.filter(options.targets, function (t) {
        return !t.hide;
      });
      targets = _lodash2.default.filter(targets, function (t) {
        return t.summary && t.summary.uri;
      });

      var _request_data = {
        range: options.range,
        interval: options.interval,
        format: "json",
        maxDataPoints: options.maxDataPoints,
        targets: _lodash2.default.map(targets, function (t) {
          return t.summary.uri;
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

      var series_promises = _lodash2.default.map(targets, function (t) {
        return _this.get_dataset(_request_data, t.measurement_type + ":" + t.participants.text + ":" + t.metric_type + ":" + t.summary.text, t.summary.uri, t.metric_type);
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
        url: this.url + "/grafana/measurement-types",
        method: 'POST',
        data: { hostname: this.measurementArchiveHostname }
      };

      if (query.query == 'measurement types') {
        backend_request.url = this.url + "/grafana/measurement-types";
      } else if (query.query == 'participants') {
        backend_request.url = this.url + "/grafana/participants";
        backend_request.data['measurement-type'] = query.measurement_type;
      } else if (query.query == 'metric types') {
        backend_request.url = this.url + "/grafana/metric-types";
      } else if (query.query == 'summaries') {
        backend_request.url = this.url + "/grafana/summaries";
        backend_request.data['measurement-type'] = query.measurement_type;
        backend_request.data['metadata-key'] = query.participants['metadata-key'] || '';
      }

      return this.backendSrv.datasourceRequest(backend_request).then(function (rsp) {
        if (rsp.status !== 200) {
          return undefined;
        }

        var query_result = null;

        if (query.query == 'summaries') {
          query_result = _lodash2.default.map(rsp.data, function (x) {
            x.text = x.type + ":" + x.window;
            return {
              text: x.text,
              value: x
            };
          });
        } else if (query.query == 'participants') {
          query_result = _lodash2.default.map(rsp.data, function (x) {
            x.text = x.source + "->" + x.destination;
            return {
              text: x.text,
              value: x
            };
          });
        } else {
          query_result = _lodash2.default.map(rsp.data, function (x) {
            return { text: x, value: x };
          });
        }

        return query_result;
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
