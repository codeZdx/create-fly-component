import React, { Component } from "react";
import { Search,Operate,MngTable } from "./modules";

class Test extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div id="Test">
                <Search /><Operate /><MngTable />
            </div>
        );
    }
}

module.exports = Test;
