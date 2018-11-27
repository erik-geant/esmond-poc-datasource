import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.unselected_measurement_type = 'measurement type';
    this.unselected_participants = 'participants';
    this.unselected_metric_type = 'metric type';
    this.unselected_summary = 'summary'

    this.scope = $scope;
    this.target.measurement_type
        = this.target.measurement_type
          || this.unselected_measurement_type;
    this.target.participants
        = this.target.participants
          || this.unselected_participants;
    this.target.metric_type
        = this.target.metric_type
          || this.unselected_metric_type;
    this.target.summary
        = this.target.summary
          || this.unselected_summary;
  }

  getOptions(query) {
    return this.datasource.metricFindQuery({
      query: query,
      measurement_type: this.target.measurement_type,
      participants: this.target.participants,
      metric_type: this.target.metric_type,
      summary: this.target.summary
    });
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal(option) {
    if (option == 'measurement types') {
      this.target.participants = this.unselected_participants;
      this.target.metric_type = this.unselected_metric_type;
      this.target.summary = this.unselected_summary;
    } else if (option == 'participants') {
      this.target.metric_type = this.unselected_metric_type;
      this.target.summary = this.unselected_summary;
    } else if (option == 'metric types') {
      this.target.summary = this.unselected_summary;
    }
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

