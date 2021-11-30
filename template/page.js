import React, { Component } from "react";
import { ComponentString } from "./modules";

class componentName extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div id="componentName">
                <ComponentItem />
            </div>
        );
    }
}

module.exports = componentName;
