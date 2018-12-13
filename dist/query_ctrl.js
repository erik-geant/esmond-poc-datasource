'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GenericDatasourceQueryCtrl = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sdk = require('app/plugins/sdk');

require('./css/query-editor.css!');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenericDatasourceQueryCtrl = exports.GenericDatasourceQueryCtrl = function (_QueryCtrl) {
  _inherits(GenericDatasourceQueryCtrl, _QueryCtrl);

  function GenericDatasourceQueryCtrl($scope, $injector) {
    _classCallCheck(this, GenericDatasourceQueryCtrl);

    var _this = _possibleConstructorReturn(this, (GenericDatasourceQueryCtrl.__proto__ || Object.getPrototypeOf(GenericDatasourceQueryCtrl)).call(this, $scope, $injector));

    _this.unselected_measurement_type = 'measurement type';
    _this.unselected_participants = 'participants';
    _this.unselected_metric_type = 'metric type';
    _this.unselected_summary = 'summary';

    _this.scope = $scope;
    _this.target.measurement_type = _this.target.measurement_type || _this.unselected_measurement_type;
    _this.target.participants = _this.target.participants || _this.unselected_participants;
    _this.target.metric_type = _this.target.metric_type || _this.unselected_metric_type;
    _this.target.summary = _this.target.summary || _this.unselected_summary;
    return _this;
  }

  _createClass(GenericDatasourceQueryCtrl, [{
    key: 'getOptions',
    value: function getOptions(query) {
      return this.datasource.metricFindQuery({
        query: query,
        measurement_type: this.target.measurement_type,
        participants: this.target.participants,
        metric_type: this.target.metric_type,
        summary: this.target.summary
      });
    }
  }, {
    key: 'toggleEditorMode',
    value: function toggleEditorMode() {
      this.target.rawQuery = !this.target.rawQuery;
    }
  }, {
    key: 'onChangeInternal',
    value: function onChangeInternal(option) {
      if (option == 'measurement types') {
        this.target.participants = this.unselected_participants;
        this.target.metric_type = this.unselected_metric_type;
        this.target.summary = this.unselected_summary;
      } else if (option == 'participants') {
        this.target.metric_type = this.unselected_metric_type;
        this.target.summary = this.unselected_summary;
      } else if (option == 'summaries') {
        this.target.metric_type = this.unselected_metric_type;
      }
      this.panelCtrl.refresh(); // Asks the panel to refresh data.
    }
  }]);

  return GenericDatasourceQueryCtrl;
}(_sdk.QueryCtrl);

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
//# sourceMappingURL=query_ctrl.js.map
