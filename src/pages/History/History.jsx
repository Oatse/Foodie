import React, { useState, useEffect } from 'react';
import './History.css';
import Notification from '../../components/Notification/Notification';

const History = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/controllers/OrderController.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setOrders(data.data);
      } else {
        throw new Error(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (orderId) => {
    setConfirmDelete(orderId);
    setNotification({
      type: 'warning',
      title: 'Konfirmasi Penghapusan',
      message: 'Apakah Anda yakin ingin menghapus pesanan ini?',
      showActions: true,
      onConfirm: async () => {
        try {
          const response = await fetch(
            `/api/controllers/OrderController.php?id=${orderId}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          if (!response.ok) {
            throw new Error('Failed to delete order');
          }

          const data = await response.json();
          if (data.status === 'success') {
            fetchOrders();
            setNotification({
              type: 'success',
              title: 'Berhasil',
              message: 'Pesanan berhasil dihapus',
              showActions: false,
              onCancel: () => setNotification(null)
            });
          } else {
            throw new Error(data.message);
          }
        } catch (error) {
          console.error('Delete error:', error);
          setNotification({
            type: 'warning',
            title: 'Error',
            message: 'Error menghapus pesanan: ' + error.message,
            showActions: false,
            onCancel: () => setNotification(null)
          });
        }
        setConfirmDelete(null);
      },
      onCancel: () => {
        setConfirmDelete(null);
        setNotification(null);
      }
    });
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        '/api/controllers/OrderController.php',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: orderId,
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (data.status === 'success') {
        await fetchOrders();
        setEditingOrder(null);
        setNotification({
          type: 'success',
          title: 'Berhasil',
          message: 'Status pesanan berhasil diperbarui',
          showActions: false,
          onCancel: () => setNotification(null)
        });
      } else {
        throw new Error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Update error:', error);
      setNotification({
        type: 'warning',
        title: 'Error',
        message: 'Error memperbarui status: ' + error.message,
        showActions: false,
        onCancel: () => setNotification(null)
      });
    }
  };

  if (loading) {
    return <div className="history-loading">Loading...</div>;
  }

  if (error) {
    return <div className="history-error">Error: {error}</div>;
  }

  return (
    <div className="history-container">
        {notification && (
        <Notification {...notification} />
     )}
      <h1 className="history-title">Riwayat Pesanan</h1>
      <div className="orders-list">
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>Belum ada pesanan</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.created_at).toLocaleDateString("id-ID", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="order-actions">
                  {editingOrder === order.id ? (
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  ) : (
                    <>
                      <span className={`status status-${order.status}`}>
                        {order.status}
                      </span>
                      <button 
                        onClick={() => setEditingOrder(order.id)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="delete-btn"
                      >
                        Hapus
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div className="order-content">
                <div className="order-items">
                  {order.items && order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <div className="item-info">
                        <p className="item-title">{item.title}</p>
                        <p className="item-quantity">{item.quantity}x @ Rp{new Intl.NumberFormat("id-ID").format(item.price)}</p>
                      </div>
                      <div className="item-total">
                        <p>Rp{new Intl.NumberFormat("id-ID").format(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total Pembayaran</span>
                  <span>Rp{new Intl.NumberFormat("id-ID").format(order.total_amount)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;