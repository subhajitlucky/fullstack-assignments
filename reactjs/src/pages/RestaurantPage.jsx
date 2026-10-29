import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Minus, Plus } from '../components/Icons.jsx';
import { SmartImage } from '../components/SmartImage.jsx';
import { useCart } from '../lib/cart.jsx';
import { foodImages, formatAddress, restaurantImage } from '../lib/data.js';
import { useRestaurants } from '../lib/restaurants.jsx';

const portions = [
  { id: 'personal', label: 'Personal', detail: '4 slices', price: 249 },
  { id: 'medium', label: 'Medium', detail: '8 slices', price: 449 },
  { id: 'large', label: 'Family', detail: '10 slices', price: 649 },
  { id: 'jumbo', label: 'Jumbo', detail: '12 slices', price: 849 },
];

export function RestaurantPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { items, loading, error, refresh } = useRestaurants();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(3);
  const [portionId, setPortionId] = useState('medium');

  const index = items.findIndex((restaurant) => String(restaurant.restaurant_id) === String(id));
  const restaurant = index >= 0 ? items[index] : null;
  const selectedPortion = portions.find((portion) => portion.id === portionId) || portions[0];

  if (loading) {
    return (
      <main className="screen detail-screen">
        <div className="detail-loading">
          <div className="skeleton-block detail-skeleton-image" />
          <div className="skeleton-line wide" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line" />
        </div>
      </main>
    );
  }

  if (!restaurant) {
    return (
      <main className="screen detail-screen">
        <button className="back-button" type="button" onClick={() => navigate('/')} aria-label="Back to home">
          <ArrowLeft />
        </button>
        <section className="state-card detail-state">
          <h2>Restaurant not found</h2>
          <p>{error || 'This restaurant is no longer available.'}</p>
          <button type="button" className="primary-button compact" onClick={error ? refresh : () => navigate('/')}>
            {error ? 'Try again' : 'Back to home'}
          </button>
        </section>
      </main>
    );
  }

  const heroImage = foodImages[index % foodImages.length];

  const addToCart = () => {
    addItem({
      restaurantId: restaurant.restaurant_id,
      name: restaurant.restaurant_name,
      portion: `${selectedPortion.label} · ${selectedPortion.detail}`,
      price: selectedPortion.price,
      qty: quantity,
      image: heroImage,
    });
  };

  return (
    <main className="screen detail-screen">
      <div className="detail-hero-wrap">
        <SmartImage
          src={heroImage}
          fallback="/images/pizza.jpg"
          alt={restaurant.restaurant_name}
          className="detail-hero"
          loading="eager"
        />
        <div className="detail-hero-shade" aria-hidden="true" />
      </div>

      <div className="detail-content">
        <div className="detail-price-row">
          <h1>₹{selectedPortion.price}</h1>
          <div className="stepper" aria-label="Quantity">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(9, current + 1))}
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <h2 className="detail-title">{restaurant.restaurant_name}</h2>
        <p className="detail-description">{formatAddress(restaurant)}</p>

        <div className="portion-heading">
          <h3>Personal portion</h3>
        </div>

        <div className="portion-list" role="radiogroup" aria-label="Choose your portion">
          {portions.map((portion) => (
            <label
              className={`portion-row ${portionId === portion.id ? 'selected' : ''}`}
              key={portion.id}
            >
              <input
                type="radio"
                name="portion"
                value={portion.id}
                checked={portionId === portion.id}
                onChange={() => setPortionId(portion.id)}
              />
              <span className="portion-name">
                {portion.label} <small>({portion.detail})</small>
              </span>
              <span className="portion-dots" aria-hidden="true" />
              <span className="portion-price">₹{portion.price}</span>
              <span className="portion-radio" aria-hidden="true" />
            </label>
          ))}
        </div>
      </div>

      <div className="detail-footer">
        <button type="button" className="primary-button" onClick={addToCart}>
          Add to cart
        </button>
      </div>
    </main>
  );
}
