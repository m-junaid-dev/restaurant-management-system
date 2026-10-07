import { Link } from "react-router-dom";
import { Empty, ErrorBox, Loading } from "../../components/ui";

// Har restaurant-admin page pehle restaurant load karta hai; na ho to "create restaurant" ka raasta dikhata hai.
export default function Gate({ mine, children }) {
  if (mine.loading && !mine.data) return <Loading />;
  if (mine.error) return <ErrorBox message={mine.error} onRetry={mine.reload} />;
  if (!mine.restaurant)
    return <Empty text="You have not created your restaurant yet."><Link className="btn" to="/restaurant-admin/restaurant">Create restaurant</Link></Empty>;
  return children(mine.restaurant);
}
