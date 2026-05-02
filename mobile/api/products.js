// ⚠️ Replace with your PC's local IP address (not localhost!)
// Find it: Windows → ipconfig | Mac/Linux → ifconfig
//const BASE_URL = 'http://192.168.31.33:3001/api';
// const BASE_URL = 'http://192.168.31.33/api';   // 'http://192.168.1.XXX:3001/api';


// ⚠️ Make sure this IP matches your PC's WiFi IP
const BASE_URL = 'http://192.168.31.33:3001/api';

console.log('🔌 API Base URL:', BASE_URL);

export const getProducts = async () => {
  console.log('📡 Fetching products from:', `${BASE_URL}/products`);
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('📥 Response status:', response.status);
    console.log('📥 Response ok:', response.ok);
    const json = await response.json();
    console.log('📦 Response data:', JSON.stringify(json));
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (error) {
    console.log('❌ getProducts error:', error.message);
    console.log('❌ Full error:', JSON.stringify(error));
    throw error;
  }
};

export const createProduct = async (product) => {
  console.log('📡 Creating product:', JSON.stringify(product));
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    console.log('📥 Create response status:', response.status);
    const json = await response.json();
    console.log('📦 Create response:', JSON.stringify(json));
    return json;
  } catch (error) {
    console.log('❌ createProduct error:', error.message);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  console.log('📡 Deleting product id:', id);
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
    });
    console.log('📥 Delete response status:', response.status);
    const json = await response.json();
    console.log('📦 Delete response:', JSON.stringify(json));
    return json;
  } catch (error) {
    console.log('❌ deleteProduct error:', error.message);
    throw error;
  }
};