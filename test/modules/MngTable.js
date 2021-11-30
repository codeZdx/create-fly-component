import React, { Component } from "react";
import ReactMixin from "react-mixin";
import StateMixin from "reflux-state-mixin";
import { Form } from "antd";
import TestActions from "../actions";
import TestStore from "../stores";

class MngTable extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return <div></div>;
    }
}

export default Form.create()(
    ReactMixin.onClass(MngTable, StateMixin.connect(TestStore))
);
