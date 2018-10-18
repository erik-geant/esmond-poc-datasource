import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
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
        'Accept': 'application/json',
    };
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

// http://158.125.250.70/esmond/perfsonar/archive/010646242f574ca3b1d191d9b563ceb1/packet-count-sent/aggregations/3600
// http://145.23.253.34/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/
// http://145.23.253.34/esmond/perfsonar/archive/4187d2d6f4344491be2962b509c57f83/throughput/averages/86400
//http://145.23.253.34/esmond/perfsonar/archive/

  dataset(target, response) {

    var data = [];
    _.each(response.data, p => {
        data.push([p.val, 1000 * p.ts])
    });
    return {
        target: target,
        datapoints: data 
    };
  }

  get_dataset(options, target) {

    var backend_request = {
        withCredentials: this.withCredentials,
        headers: this.headers,
        url: this.url + target,
        method: 'GET'
    }
    return this.backendSrv.datasourceRequest(backend_request).then(
        rsp => { return this.dataset(target, rsp); });
  }
  
  query(options) {

   var targets = _.filter(options.targets, t => {
       return !t.type || t.type == 'timeserie'
   });
   targets = targets.filter(t => !t.hide);

    var _request_data = {
        range: options.range,
        interval: options.interval,
        format: "json",
        maxDataPoints: options.maxDataPoints,
        targets: _.map(targets, t => { return t.target })
    };
    if (targets === undefined || targets.length == 0) {
        return new Promise( (res, rej) => {
            return res({
                _request: { data: _request_data},
                data: []
            });
        });
    }


//    if (this.templateSrv.getAdhocFilters) {
//      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
//    } else {
//      query.adhocFilters = [];
//    }

    var series_promises = _.map(targets, t => {
        return this.get_dataset(_request_data, t.target)
    });
    return Promise.all(series_promises).then(series_data => {
        return {
            _request: { data: _request_data },
            data: series_data
        };
    });
  }

  testDatasource() {
    return Promise.resolve({
        status: "success",
        message: "Data source is working",
        title: "Success"
    });

//    var backend_request = {
//        withCredentials: this.withCredentials,
//        headers: this.headers,
//        // HACK HACK: grafana removes 1 trailing slash & doesn't follow redirects
//        url: this.url,
//        method: 'GET'
//    }
//    return this.backendSrv.datasourceRequest(backend_request).then(
//        rsp => {
//            if (rsp.status === 200) {
//                return {
//                    status: "success",
//                    message: "Data source is working",
//                    title: "Success"
//                 };
//        }
//    });
  }

  annotationQuery(options) {
    return Promise.resolve([]);
  }

  metricFindQuery(query) {
    var backend_request = {
        withCredentials: this.withCredentials,
        headers: this.headers,
        url: this.url + "/grafana/timeseries",
        method: 'POST',
        data: { hostname: this.measurementArchiveHostname }
    };
    return this.backendSrv.datasourceRequest(backend_request).then(
        rsp => {
            if (rsp.status !== 200) {
                return undefined;
            }
            return rsp.data;
        });
  }

  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
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

  getTagKeys(options) {
    return Promise.resolve([]);
  }
 
  getTagValues(options) {
    return Promise.resolve([]);
  }

}
