import { createContext, useState } from "react";
import { food_list } from "../assets/assets";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [orderStatus, setOrderStatus] = useState({ loading: false, error: null });

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    if (cartItems[itemId] === 1) {
      const newCartItems = { ...cartItems };
      delete newCartItems[itemId];
      setCartItems(newCartItems);
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    }
  };

  const getTotalQuantity = () => {
    return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
  };

  const getTotalCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, quantity]) => {
      const itemInfo = food_list.find((product) => product._id === itemId);
      return total + (itemInfo?.price || 0) * quantity;
    }, 0);
  };

  const clearCart = () => {
    setCartItems({});
  };

  // Update the placeOrder function in StoreContext.jsx
const placeOrder = async () => {
  setOrderStatus({ loading: true, error: null });
  
  try {
    const items = Object.entries(cartItems).map(([itemId, quantity]) => {
      const item = food_list.find((product) => product._id === itemId);
      return {
        id: itemId,
        quantity: quantity,
        price: item.price
      };
    });

    const orderData = {
      totalAmount: getTotalCartAmount() + deliveryFee,
      deliveryFee: deliveryFee,
      items: items
    };

    console.log('Sending order data:', orderData); // Debug log

    const response = await fetch('http://localhost/Foodie/Foodie/api/controllers/OrderController.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
      mode: 'cors', // Important for CORS
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Server response:', errorData); // Debug log
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.order_id) {
      clearCart();
      setOrderStatus({ loading: false, error: null });
      return true;
    } else {
      throw new Error(data.message || 'Failed to place order');
    }
  } catch (error) {
    console.error('Order error:', error); // Debug log
    setOrderStatus({ loading: false, error: error.message });
    return false;
  }
};

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalQuantity,
    clearCart,
    placeOrder,
    orderStatus
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;