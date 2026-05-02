import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
  Modal, TextInput, RefreshControl, StatusBar,
} from 'react-native';
import { getProducts, createProduct, deleteProduct } from '../api/products';

const CATEGORIES = {
  Electronics: '#6C63FF',
  Footwear: '#FF6584',
  Clothing: '#43D9A2',
};

const getCategoryColor = (cat) => CATEGORIES[cat] || '#888';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', price: '', stock: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await getProducts();
      setProducts(data);
    } catch (e) {
      setError(e.message || 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, []);

  const handleRefresh = () => { setRefreshing(true); loadProducts(); };

  const handleAdd = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Name and Price are required');
      return;
    }
    setSubmitting(true);
    try {
      await createProduct({
        name: form.name,
        category: form.category || 'General',
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
      });
      setModalVisible(false);
      setForm({ name: '', category: '', price: '', stock: '' });
      loadProducts();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteProduct(id);
          loadProducts();
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '22' }]}>
        <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
          {item.category}
        </Text>
      </View>
      <Text style={styles.productName}>{item.name}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>₹{parseFloat(item.price).toLocaleString('en-IN')}</Text>
        <Text style={styles.stock}>Stock: {item.stock}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#6C63FF" />
      <Text style={styles.loadingText}>Loading products...</Text>
    </View>
  );

  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorEmoji}>⚠️</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryBtn} onPress={loadProducts}>
        <Text style={styles.retryText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📦 Products</Text>
          <Text style={styles.headerSub}>{products.length} items in store</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6C63FF" />}
        ListEmptyComponent={<Text style={styles.emptyText}>No products found. Add one!</Text>}
      />

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Product</Text>
            {['name', 'category', 'price', 'stock'].map((field) => (
              <TextInput
                key={field}
                style={styles.input}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                placeholderTextColor="#666"
                value={form[field]}
                onChangeText={(v) => setForm((f) => ({ ...f, [field]: v }))}
                keyboardType={['price', 'stock'].includes(field) ? 'numeric' : 'default'}
              />
            ))}
            <TouchableOpacity style={styles.submitBtn} onPress={handleAdd} disabled={submitting}>
              <Text style={styles.submitText}>{submitting ? 'Saving...' : 'Save Product'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f1a' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f1a' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingTop: 50, backgroundColor: '#1a1a2e',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  addBtn: { backgroundColor: '#6C63FF', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: '#1e1e30', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#2a2a40',
  },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 18, fontWeight: '800', color: '#6C63FF' },
  stock: { fontSize: 13, color: '#888' },
  deleteBtn: { backgroundColor: '#ff4757', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  loadingText: { color: '#888', marginTop: 12, fontSize: 15 },
  errorEmoji: { fontSize: 40, marginBottom: 10 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center', marginHorizontal: 30 },
  retryBtn: { marginTop: 16, backgroundColor: '#6C63FF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e30', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 20 },
  input: {
    backgroundColor: '#0f0f1a', borderRadius: 12, padding: 14, color: '#fff',
    fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a40',
  },
  submitBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 15 },
});