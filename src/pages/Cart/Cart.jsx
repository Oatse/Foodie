import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import Notification from '../../components/Notification/Notification';


export const deliveryFee = 0;

const Cart = () => {
  const {
    cartItems,
    food_list,
    removeFromCart,
    getTotalCartAmount,
    getTotalQuantity,
    clearCart,
  } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const totalQuantity = getTotalQuantity();

  const handleCheckoutClick = () => {
    setNotification({
      type: 'warning',
      title: 'Konfirmasi Pesanan',
      message: `Anda akan melakukan checkout untuk pesanan dengan total Rp${new Intl.NumberFormat("id-ID").format(getTotalCartAmount())}. Lanjutkan?`,
      showActions: true,
      onConfirm: () => {
        processCheckout();
        setNotification(null);
      },
      onCancel: () => {
        setNotification(null);
      }
    });
  };

  const processCheckout = async () => {
    try {
      setIsLoading(true);
      setError(null);
  
      const orderData = {
        items: Object.entries(cartItems).map(([itemId, quantity]) => {
          const item = food_list.find(product => product._id === itemId);
          return {
            id: itemId,
            title: item.name,
            quantity: quantity,
            price: item.price
          };
        }),
        totalAmount: getTotalCartAmount() + deliveryFee,
        deliveryFee: deliveryFee
      };
  
      const response = await fetch('/api/controllers/OrderController.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid response from server');
      }
  
      if (responseData.status === 'success') {
        clearCart();
        setNotification({
          type: 'success',
          title: 'Berhasil',
          message: 'Pesanan Anda telah berhasil dibuat!',
          showActions: false,
          onCancel: () => {
            setNotification(null);
            navigate('/history');
          }
        });
      } else {
        throw new Error(responseData.message || 'Failed to create order');
      }
  
    } catch (error) {
      console.error('Checkout error:', error);
      setNotification({
        type: 'warning',
        title: 'Error',
        message: error.message,
        showActions: false,
        onCancel: () => setNotification(null)
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cart">
      {notification && <Notification {...notification} />}
      
      <div className="cart-items">
        <div className="cart-items-title cart-heading">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {totalQuantity === 0 ? (
          <p className="NoItems">No Items in cart</p>
        ) : (
          food_list.map((item, index) => {
            if (cartItems[item._id] > 0) {
              return (
                <React.Fragment key={item._id}>
                  <div className="cart-items-title cart-items-item">
                    <img src={item.image} alt="food img" />
                    <p>{item.name}</p>
                    <p>Rp{new Intl.NumberFormat("id-ID").format(item.price)}</p>
                    <p>{cartItems[item._id]}</p>
                    <p>
                      Rp
                      {new Intl.NumberFormat("id-ID").format(
                        item.price * cartItems[item._id]
                      )}
                    </p>
                    <p
                      className="Remove"
                      onClick={() => removeFromCart(item._id)}
                    >
                      <img
                        src={assets.remove_icon_cross}
                        alt="remove_icon_cross"
                      />
                    </p>
                  </div>
                  <hr />
                </React.Fragment>
              );
            }
            return null;
          })
        )}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Total</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>
                Rp{new Intl.NumberFormat("id-ID").format(getTotalCartAmount())}
              </p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>
                Rp{new Intl.NumberFormat("id-ID").format(getTotalCartAmount())}
              </b>
            </div>
          </div>
          <button
            disabled={getTotalCartAmount() === 0 || isLoading}
            onClick={handleCheckoutClick}
            style={{ opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'PROCESSING...' : 'CHECKOUT'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;