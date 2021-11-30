import Reflux from "reflux";
import PostJSON from "utils/ajax/postJSON";

const componentNameActions = Reflux.createActions({
    search: { asyncResult: true },
});

componentNameActions.search.listen(function (so) {
    PostJSON("", so).then(this.completed, this.failed);
});

export default componentNameActions;
