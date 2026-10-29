import { useEffect, useState } from 'react';
import { useCart } from '../lib/cart.jsx';
import { Minus, Plus, Trash, X } from './Icons.jsx';
import { SmartImage } from './SmartImage.jsx';

export function CartSheet() {
  const { items, subtotal, isOpen, closeCart, increment, decrement, remove, clear } = useCart();
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!isOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeCart();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen) setNotice('');
  }, [isOpen]);

  if (!isOpen) return null;

  const placeOrder = () => {
    clear();
    setNotice('Order placed. This is a demo checkout.');
  };

  return (
    <div className="cart-overlay" role="presentation">
      <button className="cart-backdrop" type="button" onClick={closeCart} aria-label="Close cart" />
      <section className="cart-sheet" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="sheet-grabber" aria-hidden="true" />
        <header className="cart-header">
          <div>
            <p className="eyebrow">Your order</p>
            <h2>Cart</h2>
          </div>
          <button className="icon-button soft" type="button" onClick={closeCart} aria-label="Close cart">
            <X size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="empty-illustration" aria-hidden="true">
              🍽️
            </span>
            <h3>Your cart is empty</h3>
            <p>Add a dish from a restaurant and it will show up here.</p>
          </div>
        ) : (
          <>
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.key} className="cart-item">
                  <SmartImage
                    src={item.image}
                    fallback="/images/pizza.jpg"
                    alt={item.name}
                    className="cart-thumb"
                  />
                  <div className="cart-item-copy">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-meta">{item.portion}</p>
                    <p className="cart-item-price">₹{item.price.toFixed(0)}</p>
                  </div>
                  <div className="cart-item-actions">
                    <div className="stepper small">
                      <button type="button" onClick={() => decrement(item.key)} aria-label="Decrease quantity">
                        <Minus size={14} />
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => increment(item.key)} aria-label="Increase quantity">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => remove(item.key)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-total-row">
              <span>Subtotal</span>
              <strong>₹{subtotal.toFixed(0)}</strong>
            </div>

            <button className="primary-button" type="button" onClick={placeOrder}>
              Checkout · ₹{subtotal.toFixed(0)}
            </button>
            <p className="cart-note">Demo checkout only. No payment will be processed.</p>
          </>
        )}

        {notice && <p className="cart-notice">{notice}</p>}
      </section>
    </div>
  );
}
