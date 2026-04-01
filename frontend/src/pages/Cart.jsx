import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      axios.get('http://localhost:5000/cart').then(res => setCartItems(res.data));
    }
  }, [user]);

  const updateQuantity = async (id, quantity) => {
    try {
      await axios.put(`http://localhost:5000/cart/${id}`, { quantity });
      setCartItems(cartItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    } catch (error) {
      alert('Failed to update cart');
    }
  };

  const removeItem = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/cart/${id}`);
      setCartItems(cartItems.filter(item => item.id !== id));
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (!user) {
    return <div>Please login to view your cart.</div>;
  }

  return (
    <div>
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} width="50" />
              <div>
                <h4>{item.name}</h4>
                <p>KES {item.price}</p>
              </div>
              <input 
                type="number" 
                value={item.quantity} 
                onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))} 
                min="1" 
              />
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          ))}
          <h3>Total: KES {total.toFixed(2)}</h3>
          <Link to="/checkout"><button>Checkout</button></Link>
        </>
      )}
    </div>
  );
};

export default Cart;