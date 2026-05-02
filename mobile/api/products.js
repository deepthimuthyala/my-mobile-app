const BASE_URL = 'http://192.168.31.33:3001/api';

console.log('🔌 API Base URL:', BASE_URL);

export const getProducts = async () => {
  console.log('📡 Fetching products...');
  try {
    const response = await fetch(`${BASE_URL}/products`);
    const json = await response.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
  } catch (error) {
    console.log('❌ getProducts error:', error.message);
    throw error;
  }
};

export const createProduct = async (product) => {
  console.log('📡 Creating product:', product.name);
  try {
    const response = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    const json = await response.json();
    console.log('📦 Create response:', JSON.stringify(json));
    return json;
  } catch (error) {
    console.log('❌ createProduct error:', error.message);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await fetch(`${BASE_URL}/products/${id}`, { method: 'DELETE' });
    return response.json();
  } catch (error) {
    console.log('❌ deleteProduct error:', error.message);
    throw error;
  }
};