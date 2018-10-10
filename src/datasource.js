import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/json'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

// http://158.125.250.70/esmond/perfsonar/archive/010646242f574ca3b1d191d9b563ceb1/packet-count-sent/aggregations/3600

  dataset(target, response) {
    var data = [];
    _.each(response.data, p => {
        data.push([p.ts, p.value])
    });
    return {
        target: target,
        datapoints: data 
    };
  }

  get_dataset(target) {
    var backend_request = {
        withCredentials: this.withCredentials,
        headers: this.headers,
        url: this.url + target,
        method: 'GET'
    }

    return new Promise( (RSLV, REJ) => {
        this.backend.datasourceRequest(
            backend_request).then(rsp => {
                return RSLV(dataset(target, rsp);
            })
    );
  }
  
  query(options) {
    var targets = _.filter(options.targets, t => {
        return t.target != 'select metric'
    })
    targets = targets.filter(t => !t.hide);
    if (targets === undefined || targets.length == 0) {
        return Promise.resolve({data: []});
    }

//    if (this.templateSrv.getAdhocFilters) {
//      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
//    } else {
//      query.adhocFilters = [];
//    }

    return new Promise( (RSLV, REJ) => {
        response = [],
        _.each(targets, t => { response.push(get_dataset(t)); });
        return RSLV(response);
    };
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/esmond/perfsonar/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return {
            status: "success",
            message: "Data source is working",
            title: "Success" };
      }
    });
  }

  annotationQuery(options) {
    return Promise.resolve([]);
  }

  metricFindQuery(query) {
    return Promise.resolve(
       [{text: "aaaa", value: "aaaa"}]
    );
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
