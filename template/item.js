import React, { Component } from "react";
import ReactMixin from "react-mixin";
import StateMixin from "reflux-state-mixin";
import { Form } from "antd";
import componentNameActions from "../actions";
import componentNameStore from "../stores";

class componentItem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return <div></div>;
    }
}

export default Form.create()(
    ReactMixin.onClass(componentItem, StateMixin.connect(componentNameStore))
);
