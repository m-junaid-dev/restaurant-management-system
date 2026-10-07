import { Link } from "react-router-dom";
import { Empty } from "../components/ui";
export default function NotFound() {
  return <div className="wrap section"><Empty text="We could not find that page."><Link className="btn" to="/">Go home</Link></Empty></div>;
}
