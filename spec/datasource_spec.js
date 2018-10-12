import {Datasource} from "../module";
import Q from "q";

describe('GenericDatasource', function() {
    var ctx = {};

    beforeEach(function() {
        ctx.$q = Q;
        ctx.backendSrv = {};
        ctx.templateSrv = {};
        var jsonData = { measurementKey: '010646242f574ca3b1d191d9b563ceb1' }
        ctx.ds = new Datasource(
            {jsonData: jsonData},
            ctx.$q,
            ctx.backendSrv,
            ctx.templateSrv);
    });

    it('should return an empty array when no targets are set', function(done) {
        ctx.ds.query({targets: []}).then(function(result) {
            expect(result.data).to.have.length(0);
            done();
        });
    });

    it('should return the server results when a target is set', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            var response = {
                _request: request,
                data: [
                    { ts: 123, value: 12.22 },
                    { ts: 234, value: 23.33 },
                    { ts: 111, value: 11.11 },
                    { ts: 0, value: 0 },
                    { ts: 999, value: 0.999 }
               ]
            };
            return ctx.$q.when(response);
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        var query_targets = [
            {target: 'packet-count-sent/aggregations/3600', type: 'timeserie'},
            {target: 'packet-count-sent/aggregations/86400', type: 'timeserie'}
        ]

        ctx.ds.query({targets: query_targets}).then(function(result) {
            expect(result._request.data.targets).to.have.length(2);

            var series = result.data[0];
            expect(series.target).to.equal('packet-count-sent/aggregations/3600');
            expect(series.datapoints).to.have.length(5);
            done();
        });
    });

    it ('should return the metric results when a target is null', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                status: 200,
                _request: request,
                data: [
    {
        "url": "http://145.23.253.34/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/",
        "metadata-key": "248d16f1035f440aa1239d4a4bafd245",
        "subject-type": "point-to-point",
        "event-types": [
            {
                "summaries": [],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-reorders-bidir/base",
                "event-type": "packet-reorders-bidir"
            },
            {
                "summaries": [
                    {
                        "summary-type": "aggregation",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-loss-rate-bidir/aggregations/3600",
                        "time-updated": 1457437301,
                        "summary-window": "3600"
                    },
                    {
                        "summary-type": "aggregation",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-loss-rate-bidir/aggregations/86400",
                        "time-updated": 1457437301,
                        "summary-window": "86400"
                    }
                ],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-loss-rate-bidir/base",
                "event-type": "packet-loss-rate-bidir"
            },
            {
                "summaries": [],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-count-sent/base",
                "event-type": "packet-count-sent"
            },
            {
                "summaries": [
                    {
                        "summary-type": "aggregation",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/aggregations/3600",
                        "time-updated": 1457437301,
                        "summary-window": "3600"
                    },
                    {
                        "summary-type": "aggregation",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/aggregations/86400",
                        "time-updated": 1457437301,
                        "summary-window": "86400"
                    },
                    {
                        "summary-type": "statistics",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/statistics/0",
                        "time-updated": 1457437301,
                        "summary-window": "0"
                    },
                    {
                        "summary-type": "statistics",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/statistics/3600",
                        "time-updated": 1457437301,
                        "summary-window": "3600"
                    },
                    {
                        "summary-type": "statistics",
                        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/statistics/86400",
                        "time-updated": 1457437301,
                        "summary-window": "86400"
                    }
                ],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-rtt/base",
                "event-type": "histogram-rtt"
            },
            {
                "summaries": [],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/histogram-ttl-reverse/base",
                "event-type": "histogram-ttl-reverse"
            },
            {
                "summaries": [],
                "time-updated": null,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/failures/base",
                "event-type": "failures"
            },
            {
                "summaries": [],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-count-lost-bidir/base",
                "event-type": "packet-count-lost-bidir"
            },
            {
                "summaries": [],
                "time-updated": 1457437301,
                "base-uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/packet-duplicates-bidir/base",
                "event-type": "packet-duplicates-bidir"
            }
        ],
        "source": "145.23.253.34",
        "destination": "198.124.238.14",
        "measurement-agent": "145.23.253.34",
        "tool-name": "bwctl/ping",
        "input-source": "145.23.253.34",
        "input-destination": "amst-pt1.es.net",
        "ip-packet-size": "1000",
        "ip-transport-protocol": "icmp",
        "ip-ttl": "255",
        "sample-size": "10",
        "time-interval": "300",
        "time-probe-interval": "1",
        "uri": "/esmond/perfsonar/archive/248d16f1035f440aa1239d4a4bafd245/"
    },
    {
        "url": "http://145.23.253.34/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/",
        "metadata-key": "25799ddc29344e6c96d728a5830ac24e",
        "subject-type": "point-to-point",
        "event-types": [
            {
                "summaries": [],
                "time-updated": null,
                "base-uri": "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/failures/base",
                "event-type": "failures"
            },
            {
                "summaries": [],
                "time-updated": 1457962021,
                "base-uri": "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/throughput-subintervals/base",
                "event-type": "throughput-subintervals"
            },
            {
                "summaries": [
                    {
                        "summary-type": "average",
                        "uri": "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/throughput/averages/86400",
                        "time-updated": 1457962021,
                        "summary-window": "86400"
                    }
                ],
                "time-updated": 1457962021,
                "base-uri": "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/throughput/base",
                "event-type": "throughput"
            }
        ],
        "source": "198.124.238.42",
        "destination": "145.23.253.34",
        "measurement-agent": "145.23.253.34",
        "tool-name": "bwctl/iperf3",
        "input-source": "aofa-pt1.es.net",
        "input-destination": "145.23.253.34",
        "bw-parallel-streams": "1",
        "ip-transport-protocol": "tcp",
        "time-duration": "20",
        "time-interval": "7200",
        "uri": "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/"
    }
               ]
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

         ctx.ds.metricFindQuery('search').then(function(result) {
            expect(result).to.have.length(1);
            var dest = "145.23.253.34";
            var uri = "/esmond/perfsonar/archive/25799ddc29344e6c96d728a5830ac24e/throughput/averages/86400";
            var sumwin = "86400";
            var type = "throughput";
            expect(result[0].text).to.equal(dest + ", " + type + " [" + sumwin + "]");
            expect(result[0].value).to.equal(uri);
            done();
        });
 
        
    });
 

/*
    it ('should return the metric results when a target is null', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: [
                    "metric_0",
                    "metric_1",
                    "metric_2",
                ]
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        ctx.ds.metricFindQuery({target: null}).then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal('metric_0');
            expect(result[0].value).to.equal('metric_0');
            expect(result[1].text).to.equal('metric_1');
            expect(result[1].value).to.equal('metric_1');
            expect(result[2].text).to.equal('metric_2');
            expect(result[2].value).to.equal('metric_2');
            done();
        });
    });

    it ('should return the metric target results when a target is set', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            var target = request.data.target;
            var result = [target + "_0", target + "_1", target + "_2"];

            return ctx.$q.when({
                _request: request,
                data: result
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        ctx.ds.metricFindQuery('search').then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal('search_0');
            expect(result[0].value).to.equal('search_0');
            expect(result[1].text).to.equal('search_1');
            expect(result[1].value).to.equal('search_1');
            expect(result[2].text).to.equal('search_2');
            expect(result[2].value).to.equal('search_2');
            done();
        });
    });
*/

/*
    it ('should return the metric results when the target is an empty string', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: [
                    "metric_0",
                    "metric_1",
                    "metric_2",
                ]
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        ctx.ds.metricFindQuery('').then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal('metric_0');
            expect(result[0].value).to.equal('metric_0');
            expect(result[1].text).to.equal('metric_1');
            expect(result[1].value).to.equal('metric_1');
            expect(result[2].text).to.equal('metric_2');
            expect(result[2].value).to.equal('metric_2');
            done();
        });
    });

    it ('should return the metric results when the args are an empty object', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: [
                    "metric_0",
                    "metric_1",
                    "metric_2",
                ]
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        ctx.ds.metricFindQuery().then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal('metric_0');
            expect(result[0].value).to.equal('metric_0');
            expect(result[1].text).to.equal('metric_1');
            expect(result[1].value).to.equal('metric_1');
            expect(result[2].text).to.equal('metric_2');
            expect(result[2].value).to.equal('metric_2');
            done();
        });
    });

    it ('should return the metric target results when the args are a string', function(done) {
        ctx.backendSrv.datasourceRequest = function(request) {
            var target = request.data.target;
            var result = [target + "_0", target + "_1", target + "_2"];

            return ctx.$q.when({
                _request: request,
                data: result
            });
        };

        ctx.templateSrv.replace = function(data) {
            return data;
        }

        ctx.ds.metricFindQuery('search').then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal('search_0');
            expect(result[0].value).to.equal('search_0');
            expect(result[1].text).to.equal('search_1');
            expect(result[1].value).to.equal('search_1');
            expect(result[2].text).to.equal('search_2');
            expect(result[2].value).to.equal('search_2');
            done();
        });
    });
*/

    it ('should return data as text and as value', function(done) {
        var result = ctx.ds.mapToTextValue({data: ["zero", "one", "two"]});

        expect(result).to.have.length(3);
        expect(result[0].text).to.equal('zero');
        expect(result[0].value).to.equal('zero');
        expect(result[1].text).to.equal('one');
        expect(result[1].value).to.equal('one');
        expect(result[2].text).to.equal('two');
        expect(result[2].value).to.equal('two');
        done();
    });

    it ('should return text as text and value as value', function(done) {
        var data = [
            {text: "zero", value: "value_0"},
            {text: "one", value: "value_1"},
            {text: "two", value: "value_2"},
        ];

        var result = ctx.ds.mapToTextValue({data: data});

        expect(result).to.have.length(3);
        expect(result[0].text).to.equal('zero');
        expect(result[0].value).to.equal('value_0');
        expect(result[1].text).to.equal('one');
        expect(result[1].value).to.equal('value_1');
        expect(result[2].text).to.equal('two');
        expect(result[2].value).to.equal('value_2');
        done();
    });

    it ('should return data as text and index as value', function(done) {
        var data = [
            {a: "zero", b: "value_0"},
            {a: "one", b: "value_1"},
            {a: "two", b: "value_2"},
        ];

        var result = ctx.ds.mapToTextValue({data: data});

        expect(result).to.have.length(3);
        expect(result[0].text).to.equal(data[0]);
        expect(result[0].value).to.equal(0);
        expect(result[1].text).to.equal(data[1]);
        expect(result[1].value).to.equal(1);
        expect(result[2].text).to.equal(data[2]);
        expect(result[2].value).to.equal(2);
        done();
    });

/*
    it('should support tag keys', function(done) {
        var data =  [{'type': 'string', 'text': 'One', 'key': 'one'}, {'type': 'string', 'text': 'two', 'key': 'Two'}];

        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: data
            });
        };

        ctx.ds.getTagKeys().then(function(result) {
            expect(result).to.have.length(2);
            expect(result[0].type).to.equal(data[0].type);
            expect(result[0].text).to.equal(data[0].text);
            expect(result[0].key).to.equal(data[0].key);
            expect(result[1].type).to.equal(data[1].type);
            expect(result[1].text).to.equal(data[1].text);
            expect(result[1].key).to.equal(data[1].key);
            done();
        });
    });

    it('should support tag values', function(done) {
        var data =  [{'key': 'eins', 'text': 'Eins!'}, {'key': 'zwei', 'text': 'Zwei'}, {'key': 'drei', 'text': 'Drei!'}];

        ctx.backendSrv.datasourceRequest = function(request) {
            return ctx.$q.when({
                _request: request,
                data: data
            });
        };

        ctx.ds.getTagValues().then(function(result) {
            expect(result).to.have.length(3);
            expect(result[0].text).to.equal(data[0].text);
            expect(result[0].key).to.equal(data[0].key);
            expect(result[1].text).to.equal(data[1].text);
            expect(result[1].key).to.equal(data[1].key);
            expect(result[2].text).to.equal(data[2].text);
            expect(result[2].key).to.equal(data[2].key);
            done();
        });
    });
*/
});
