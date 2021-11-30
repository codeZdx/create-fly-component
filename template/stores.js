import Reflux from "reflux";
import StateMixin from "reflux-state-mixin";
import { message } from "antd";
import componentNameActions from "../actions";

const componentNameStore = Reflux.createStore({
    mixins: [StateMixin.store],
    listenables: componentNameActions,
    getInitialState: function () {
        return {
            loading: false,
            so: {},
            dataSource: [],
            pageSize: 10,
            currentPage: 1,
            totalSize: 0,
        };
    },
    onSearch(so) {
        this.setState({ so, loading: true });
    },
    onSearchCompleted(result) {
        let volist = [];
        let totalSize = 0;
        if (result.success) {
            volist = result.data || result.voList;
            if (!isArray(volist)) {
                volist = [];
            }
            totalSize = result.count || result.total;
        } else {
            message.error(`查询失败:${result.message}`);
            volist = [];
            totalSize = 0;
        }
        this.setState({
            loading: false,
            dataSource: volist,
            totalSize,
        });
    },
    onSearchFailed(error) {
        message.error("调用失败:" + error.status);
        this.setState({ loading: false, dataSource: [] });
    },
});

export default componentNameStore;
