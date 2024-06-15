import { get, find, toUpper } from "lodash";
import React, {useEffect} from "react";
import PropTypes from "prop-types";
import Chat from '@/services/chat';
import Modal from "antd/lib/modal";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import navigateTo from "@/components/ApplicationArea/navigateTo";
import LoadingState from "@/components/items-list/components/LoadingState";
import DynamicForm from "@/components/dynamic-form/DynamicForm";
import helper from "@/components/dynamic-form/dynamicFormHelper";
import HelpTrigger, { TYPES as HELP_TRIGGER_TYPES } from "@/components/HelpTrigger";
import wrapSettingsTab from "@/components/SettingsWrapper";

import DataSource, { IMG_ROOT } from "@/services/data-source";
import notification from "@/services/notification";
import routes from "@/services/routes";

class EditDataSource extends React.Component {
  static propTypes = {
    dataSourceId: PropTypes.string.isRequired,
    onError: PropTypes.func,
  };

  static defaultProps = {
    onError: () => {},
  };

  state = {
    dataSource: null,
    type: null,
    loading: true,
    tableName: null
  };

  componentDidMount() {
    this.fetchSchema();
    DataSource.get({ id: this.props.dataSourceId })
      .then(dataSource => {
        const { type } = dataSource;
        this.setState({ dataSource });
        DataSource.types().then(types => this.setState({ type: find(types, { type }), loading: false }));
      })
      .catch(error => this.props.onError(error));
  }
 
  saveDataSource = (values, successCallback, errorCallback) => {
    const { dataSource } = this.state;
    helper.updateTargetWithValues(dataSource, values);
    DataSource.save(dataSource)
      .then(() => successCallback("Saved."))
      .catch(error => {
        const message = get(error, "response.data.message", "Failed saving.");
        errorCallback(message);
      });
  };

  deleteDataSource = callback => {
    const { dataSource } = this.state;

    const doDelete = () => {
      DataSource.delete(dataSource)
        .then(() => {
          notification.success("Data source deleted successfully.");
          navigateTo("data_sources");
        })
        .catch(() => {
          callback();
        });
    };

    Modal.confirm({
      title: "Delete Data Source",
      content: "Are you sure you want to delete this data source?",
      okText: "Delete",
      okType: "danger",
      onOk: doDelete,
      onCancel: callback,
      maskClosable: true,
      autoFocusButton: null,
    });
  };

  testConnection = callback => {
    const { dataSource } = this.state;
    DataSource.test({ id: dataSource.id })
      .then(httpResponse => {
        if (httpResponse.ok) {
          notification.success("Success");
          this.postquery();
        } else {
          notification.error("Connection Test Failed:", httpResponse.message, { duration: 10 });
        }
        callback();
      })
      .catch(() => {
        notification.error(
          "Connection Test Failed:",
          "Unknown error occurred while performing connection test. Please try again later.",
          { duration: 10 }
        );
        callback();
      });
  };

  postquery = async() => {  
    const { tableName } = this.state;
    const query_data = {
        "name": `Chat Query`,
        "query": `select * from ${tableName}`,
        "schedule": {"interval": "3600"},
        "data_source_id": this.props.dataSourceId,
    }
    const response = await Chat.createquery(query_data)
    console.log("i hear", response)
    this.executequery(response.id)
  }

  executequery = async(qry_id) => {
    const { tableName } = this.state;
    const queryData = {
      query: `select * from ${tableName}`,
      query_id: qry_id,
      max_age: 0, 
      data_source_id: this.props.dataSourceId,
      parameters: {}, 
      apply_auto_limit: false 
    };
    const response = await Chat.postqryResult(queryData);
    let jobId = response.job.id;
    let resultId = null;
    if (resultId === null) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
        const jobResponse = await Chat.getjob(jobId);
        resultId = jobResponse.job.result_id;
        let result = await Chat.fetchqryResult(resultId)
        const passdata = {
          data: result
        };
        const final = await Chat.DataToGpt(passdata) 
      } catch(error){}
    } else {} 
  }

  fetchSchema = async() => {
    const response = await Chat.fetchSchema(this.props.dataSourceId);
    const tableName = response['schema'][0]['name']
    this.setState({ tableName });  
  }

  renderForm() {
    const { dataSource, type } = this.state;
    const fields = helper.getFields(type, dataSource);  
    const helpTriggerType = `DS_${toUpper(type.type)}`;
    const formProps = {
      fields,
      type,
      actions: [
        { name: "Delete", type: "danger", callback: this.deleteDataSource },
        { name: "Test Connection", pullRight: true, callback: this.testConnection, disableWhenDirty: true },
      ],
      onSubmit: this.saveDataSource,
      feedbackIcons: true,
      defaultShowExtraFields: helper.hasFilledExtraField(type, dataSource),
    };

  
    return (
      <div className="row" data-test="DataSource">
        <div className="text-right m-r-10">
          {HELP_TRIGGER_TYPES[helpTriggerType] && (
            <HelpTrigger className="f-13" type={helpTriggerType}>
              Setup Instructions <i className="fa fa-question-circle" aria-hidden="true" />
              <span className="sr-only">(help)</span>
            </HelpTrigger>
          )}
        </div>
        <div className="text-center m-b-10">
          <img className="p-5" src={`${IMG_ROOT}/${type.type}.png`} alt={type.name} width="64" />
          <h3 className="m-0">{type.name}</h3>
        </div>
        <div className="col-md-4 col-md-offset-4 m-b-10">
          <DynamicForm {...formProps} />
        </div>
      </div>
    );
  }

  render() {
    return this.state.loading ? <LoadingState className="" /> : this.renderForm();
  }
}

const EditDataSourcePage = wrapSettingsTab("DataSources.Edit", null, EditDataSource);

routes.register(
  "DataSources.Edit",
  routeWithUserSession({
    path: "/data_sources/:dataSourceId",
    title: "Data Sources",
    render: pageProps => <EditDataSourcePage {...pageProps} />,
  })
);
