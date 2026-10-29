import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bag,
  ChevronDown,
  Clock,
  LogOut,
  MapPin,
  Search,
  Sliders,
  Sparkle,
  Star,
  X,
} from '../components/Icons.jsx';
import { SmartImage } from '../components/SmartImage.jsx';
import { useAuth } from '../lib/auth.jsx';
import { useCart } from '../lib/cart.jsx';
import {
  foodImages,
  formatAddress,
  initials,
  priceFor,
  restaurantImage,
} from '../lib/data.js';
import { useRestaurants } from '../lib/restaurants.jsx';

function Skeleton() {
  return (
    <div className="skeleton-wrap" aria-label="Loading restaurants">
      <div className="skeleton-line wide" />
      <div className="skeleton-best">
        {[0, 1, 2, 3].map((item) => (
          <div className="skeleton-best-card" key={item}>
            <div className="skeleton-block" />
            <div className="skeleton-line short" />
          </div>
        ))}
      </div>
      <div className="skeleton-block promo" />
      {[0, 1, 2].map((item) => (
        <div className="skeleton-row" key={item}>
          <div className="skeleton-thumb" />
          <div className="skeleton-row-copy">
            <div className="skeleton-line" />
            <div className="skeleton-line medium" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { count, openCart } = useCart();
  const { items, loading, error, refresh } = useRestaurants();
  const [query, setQuery] = useState('');
  const [sortAZ, setSortAZ] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    let next = items.filter((restaurant) => {
      if (!search) return true;
      return (
        restaurant.restaurant_name?.toLowerCase().includes(search) ||
        formatAddress(restaurant).toLowerCase().includes(search)
      );
    });

    if (sortAZ) {
      next = [...next].sort((a, b) =>
        (a.restaurant_name || '').localeCompare(b.restaurant_name || ''),
      );
    }

    return next;
  }, [items, query, sortAZ]);

  const featured = items.slice(0, 4);
  const popular = filtered.slice(0, 12);
  const openRestaurant = (id) => navigate(`/restaurant/${id}`);

  return (
    <main className="screen home-screen">
      <header className="home-header">
        <div className="location-block">
          <span className="eyebrow">Current Location</span>
          <div className="location-value">
            <MapPin size={16} />
            <span>Model Town, New Delhi</span>
            <ChevronDown size={15} />
          </div>
        </div>

        <div className="profile-wrap">
          <button
            className="avatar-button"
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Open profile menu"
            aria-expanded={menuOpen}
          >
            {initials(user?.name) || 'C'}
          </button>
          {menuOpen && (
            <div className="profile-menu">
              <div className="profile-menu-head">
                <strong>Craving member</strong>
                <span>+91 {user?.phone || ''}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                  window.location.assign('/login');
                }}
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="search-row">
        <label className="search-field">
          <Search size={19} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search restaurants"
            aria-label="Search restaurants"
          />
          {query && (
            <button type="button" className="clear-search" onClick={() => setQuery('')} aria-label="Clear search">
              <X size={15} />
            </button>
          )}
        </label>

        <button
          type="button"
          className={`square-button orange ${sortAZ ? 'is-active' : ''}`}
          onClick={() => setSortAZ((current) => !current)}
          aria-label={sortAZ ? 'Reset sorting' : 'Sort restaurants A to Z'}
          title={sortAZ ? 'Sorted A–Z' : 'Sort A–Z'}
        >
          <Sliders size={19} />
        </button>

        <button type="button" className="square-button blue" onClick={openCart} aria-label="Open cart">
          <Bag size={19} />
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
      </div>

      {loading ? (
        <Skeleton />
      ) : error ? (
        <section className="state-card">
          <span className="state-icon">!</span>
          <h2>We couldn&apos;t load restaurants</h2>
          <p>{error}</p>
          <button type="button" className="primary-button compact" onClick={refresh}>
            Try again
          </button>
        </section>
      ) : (
        <>
          <section className="section">
            <div className="section-head">
              <h2>Best Seller</h2>
              <span className="section-note">{items.length} places nearby</span>
            </div>

            <div className="best-scroll">
              {featured.map((restaurant, index) => (
                <button
                  type="button"
                  className="best-card"
                  key={restaurant.restaurant_id}
                  onClick={() => openRestaurant(restaurant.restaurant_id)}
                >
                  <span className="best-image-wrap">
                    <SmartImage
                      src={restaurantImage(restaurant, index)}
                      fallback={foodImages[index % foodImages.length]}
                      alt={restaurant.restaurant_name}
                      className="best-image"
                    />
                    <span className="best-price">₹{priceFor(index)}</span>
                  </span>
                  <span className="best-name">{restaurant.restaurant_name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="promo-banner">
            <div className="promo-copy">
              <span className="promo-kicker">
                <Sparkle size={14} /> Fresh from the kitchen
              </span>
              <h2>Experience our delicious new dish</h2>
              <strong>30% OFF</strong>
              <button
                type="button"
                className="promo-button"
                onClick={() => featured[0] && openRestaurant(featured[0].restaurant_id)}
              >
                Order now
              </button>
            </div>
            <img src="/images/pizza.jpg" alt="Freshly baked pizza" className="promo-image" />
            <span className="promo-dots" aria-hidden="true">
              <i className="active" />
              <i />
              <i />
            </span>
          </section>

          <section className="section popular-section">
            <div className="section-head">
              <h2>Popular Restaurants</h2>
              <span className="section-note">{filtered.length} found</span>
            </div>

            {popular.length === 0 ? (
              <div className="state-card small">
                <h3>No matching restaurants</h3>
                <p>Try a different name or clear your search.</p>
                <button type="button" className="link-button" onClick={() => setQuery('')}>
                  Clear search
                </button>
              </div>
            ) : (
              <div className="popular-list">
                {popular.map((restaurant, index) => (
                  <article className="popular-card" key={restaurant.restaurant_id}>
                    <SmartImage
                      src={restaurantImage(restaurant, index + 4)}
                      fallback={foodImages[(index + 4) % foodImages.length]}
                      alt={restaurant.restaurant_name}
                      className="popular-thumb"
                    />
                    <div className="popular-copy">
                      <div className="popular-top">
                        <h3>{restaurant.restaurant_name}</h3>
                        <span className="popular-price">₹{priceFor(index + 4)}</span>
                      </div>
                      <p className="popular-address">{formatAddress(restaurant)}</p>
                      <div className="meta-row">
                        <span>
                          <Clock size={14} /> 20–30 min
                        </span>
                        <span>
                          <Star size={14} /> 4.5
                        </span>
                      </div>
                      <div className="popular-actions">
                        <button
                          type="button"
                          className="pill primary"
                          onClick={() => openRestaurant(restaurant.restaurant_id)}
                        >
                          View menu
                        </button>
                        <button
                          type="button"
                          className="pill subtle"
                          onClick={() => openRestaurant(restaurant.restaurant_id)}
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <p className="home-greeting">Good food, good mood.</p>
        </>
      )}
    </main>
  );
}
