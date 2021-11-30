import Reflux from "reflux";
import PostJSON from "utils/ajax/postJSON";

const TestActions = Reflux.createActions({
    search: { asyncResult: true },
});

TestActions.search.listen(function (so) {
    PostJSON("", so).then(this.completed, this.failed);
});

export default TestActions;
