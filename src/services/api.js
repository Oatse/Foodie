import App from '../App';

// File: api.js
const cors = require('cors');
const API_BASE_URL = '/api';

App.use(cors());

export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`http://localhost/Foodie/Foodie/api/controllers/OrderController.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      credentials: 'include',
      body: JSON.stringify(orderDetails)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
  
};

export const testConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test.php`);
      const data = await response.json();
      console.log('API Test Response:', data);
      return data;
    } catch (error) {
      console.error('API Test Error:', error);
      throw error;
    }
};