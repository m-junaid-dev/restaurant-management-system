import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { restaurantService, menuService } from "../services/restaurant.service";
import { useFetch } from "../hooks/hooks";
import { Async, RestaurantCard } from "../components/ui";
import FoodCard from "../components/FoodCard";

const QUICK = ["Biryani", "Burger", "Pizza", "Karahi", "Desserts"];

export default function Home() {
  const nav = useNavigate();
  const [term, setTerm] = useState("");
  const featured = useFetch(() => restaurantService.list({ limit: 6, isActive: true }));
  const first = featured.data?.items?.[0];
  const popular = useFetch(() => (first ? menuService.list(first._id, { limit: 4, availability: true }) : Promise.resolve(null)), [first?._id]);

  return (
    <>
      <section className="hero">
        <div className="wrap hero-in">
          <div>
            <h1>Garam khana, seedha aapke darwaze par.</h1>
            <p>Browse local kitchens, fill one cart, pay cash when it arrives.</p>
            <form className="search-big" onSubmit={(e) => { e.preventDefault(); nav(`/restaurants?search=${encodeURIComponent(term)}`); }}>
              <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search for a restaurant or dish" aria-label="Search" />
              <button className="btn accent">Search</button>
            </form>
            <div className="chips">
              {QUICK.map((q) => <Link key={q} to={`/restaurants?search=${q}`}>{q}</Link>)}
            </div>
          </div>
          <div className="plate" aria-hidden="true"><span>🍛</span></div>
        </div>
      </section>

      <section className="wrap section">
        <div className="between"><h2>Featured restaurants</h2><Link className="link" to="/restaurants">See all</Link></div>
        <Async q={featured} emptyText="No restaurants yet. Check back soon.">
          {(d) => <div className="grid">{d.items.map((r) => <RestaurantCard key={r._id} r={r} />)}</div>}
        </Async>
      </section>

      {popular.data?.items?.length > 0 && (
        <section className="wrap section">
          <h2>Popular at {first.name}</h2>
          <div className="grid">{popular.data.items.map((m) => <FoodCard key={m._id} item={m} restaurantId={first._id} />)}</div>
        </section>
      )}

      <section className="wrap section">
        <h2>How it works</h2>
        <ol className="steps">
          <li><b>Pick a kitchen</b><span>Open any restaurant and browse its menu.</span></li>
          <li><b>Fill your cart</b><span>One restaurant per order keeps delivery fast.</span></li>
          <li><b>Pay on delivery</b><span>Track your order until it reaches you.</span></li>
        </ol>
      </section>

      <section className="wrap section">
        <div className="cta">
          <div><h2>Run a restaurant?</h2><p>Create an account, add your menu and start receiving orders.</p></div>
          <Link className="btn accent" to="/register">Create an account</Link>
        </div>
      </section>
    </>
  );
}
