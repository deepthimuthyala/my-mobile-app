import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert,
  Modal, TextInput, RefreshControl,
  StatusBar, Image, ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { getProducts, createProduct, deleteProduct } from '../api/products';

const CATEGORIES = {
  Electronics: '#6C63FF',
  Footwear: '#FF6584',
  Clothing: '#43D9A2',
  General: '#FFA500',
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

  // Photo & Location state
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [capturingPhoto, setCapturingPhoto] = useState(false);

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

  // 📸 Capture Photo
  const handleCapturePhoto = async () => {
    setCapturingPhoto(true);
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required to capture product photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,       // 50% quality to keep size small
        base64: true,       // Get base64 to send to backend
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setPhoto({
          uri: asset.uri,
          base64: asset.base64,
        });
        console.log('📸 Photo captured successfully');
        Alert.alert('✅ Photo Captured', 'Product photo has been captured!');
      }
    } catch (err) {
      console.log('❌ Camera error:', err.message);
      Alert.alert('Error', 'Failed to capture photo: ' + err.message);
    } finally {
      setCapturingPhoto(false);
    }
  };

  // 📍 Detect Location
  const handleDetectLocation = async () => {
    setDetectingLocation(true);
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to tag product location.');
        return;
      }

      console.log('📍 Getting location...');

      // Get current coordinates
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;
      console.log('📍 Location:', latitude, longitude);

      // Reverse geocode to get address
      const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
      let address = 'Unknown location';
      if (geocode && geocode.length > 0) {
        const g = geocode[0];
        const parts = [g.street, g.district, g.city, g.region].filter(Boolean);
        address = parts.join(', ');
      }

      setLocation({ latitude, longitude });
      setLocationName(address);

      console.log('📍 Address:', address);
      Alert.alert('📍 Location Detected', address);
    } catch (err) {
      console.log('❌ Location error:', err.message);
      Alert.alert('Error', 'Failed to get location: ' + err.message);
    } finally {
      setDetectingLocation(false);
    }
  };

  // ✅ Submit Product
  const handleAdd = async () => {
    if (!form.name || !form.price) {
      Alert.alert('Error', 'Name and Price are required');
      return;
    }

    setSubmitting(true);
    try {
      const productData = {
        name: form.name,
        category: form.category || 'General',
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        photo: photo ? `data:image/jpeg;base64,${photo.base64}` : null,
        latitude: location ? location.latitude : null,
        longitude: location ? location.longitude : null,
        location_name: locationName || null,
      };

      console.log('📤 Submitting product with photo:', !!productData.photo, 'location:', locationName);

      await createProduct(productData);

      // Reset form
      setModalVisible(false);
      setForm({ name: '', category: '', price: '', stock: '' });
      setPhoto(null);
      setLocation(null);
      setLocationName('');

      Alert.alert('✅ Success', 'Product added successfully!');
      loadProducts();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setModalVisible(false);
    setForm({ name: '', category: '', price: '', stock: '' });
    setPhoto(null);
    setLocation(null);
    setLocationName('');
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
      {/* Product Photo */}
      {item.photo ? (
        <Image
          source={{ uri: item.photo }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.noImageBox}>
          <Text style={styles.noImageText}>📦 No Photo</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '22' }]}>
          <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
            {item.category}
          </Text>
        </View>

        <Text style={styles.productName}>{item.name}</Text>

        {/* Location Tag */}
        {item.location_name ? (
          <Text style={styles.locationTag}>📍 {item.location_name}</Text>
        ) : null}

        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{parseFloat(item.price).toLocaleString('en-IN')}</Text>
          <Text style={styles.stock}>Stock: {item.stock}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
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

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📦 Products</Text>
          <Text style={styles.headerSub}>{products.length} items in store</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#6C63FF" />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products found. Add one!</Text>
        }
      />

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Add New Product</Text>

              {/* Form Fields */}
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

              {/* Divider */}
              <View style={styles.divider} />

              {/* 📸 Capture Photo */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#6C63FF' }]}
                onPress={handleCapturePhoto}
                disabled={capturingPhoto}
              >
                <Text style={styles.actionBtnText}>
                  {capturingPhoto ? '📸 Opening Camera...' : photo ? '📸 Retake Photo' : '📸 Capture Product Photo'}
                </Text>
              </TouchableOpacity>

              {/* Show captured photo preview */}
              {photo && (
                <View style={styles.photoPreviewBox}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} resizeMode="cover" />
                  <TouchableOpacity
                    style={styles.removePhotoBtn}
                    onPress={() => setPhoto(null)}
                  >
                    <Text style={styles.removePhotoText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* 📍 Detect Location */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: '#43D9A2' }]}
                onPress={handleDetectLocation}
                disabled={detectingLocation}
              >
                <Text style={styles.actionBtnText}>
                  {detectingLocation ? '📍 Detecting...' : location ? '📍 Re-detect Location' : '📍 Detect My Location'}
                </Text>
              </TouchableOpacity>

              {/* Show detected location */}
              {locationName ? (
                <View style={styles.locationBox}>
                  <Text style={styles.locationBoxText}>📍 {locationName}</Text>
                  <Text style={styles.locationCoords}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </Text>
                  <TouchableOpacity onPress={() => { setLocation(null); setLocationName(''); }}>
                    <Text style={styles.removePhotoText}>✕ Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <View style={styles.divider} />

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                onPress={handleAdd}
                disabled={submitting}
              >
                <Text style={styles.submitText}>
                  {submitting ? '⏳ Saving...' : '✅ Save Product'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

            </ScrollView>
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

  // Card
  card: { backgroundColor: '#1e1e30', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#2a2a40' },
  productImage: { width: '100%', height: 180 },
  noImageBox: { width: '100%', height: 80, backgroundColor: '#2a2a40', justifyContent: 'center', alignItems: 'center' },
  noImageText: { color: '#555', fontSize: 14 },
  cardContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 8 },
  categoryText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  productName: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 4 },
  locationTag: { fontSize: 12, color: '#43D9A2', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  price: { fontSize: 18, fontWeight: '800', color: '#6C63FF' },
  stock: { fontSize: 13, color: '#888' },
  deleteBtn: { backgroundColor: '#ff4757', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  deleteBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Loading / Error
  loadingText: { color: '#888', marginTop: 12, fontSize: 15 },
  errorEmoji: { fontSize: 40, marginBottom: 10 },
  errorText: { color: '#ff6b6b', fontSize: 15, textAlign: 'center', marginHorizontal: 30 },
  retryBtn: { marginTop: 16, backgroundColor: '#6C63FF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  retryText: { color: '#fff', fontWeight: '700' },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 60, fontSize: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000cc', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#1e1e30', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, maxHeight: '92%' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 20 },
  input: {
    backgroundColor: '#0f0f1a', borderRadius: 12, padding: 14, color: '#fff',
    fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: '#2a2a40',
  },
  divider: { height: 1, backgroundColor: '#2a2a40', marginVertical: 16 },

  // Action buttons (Camera + Location)
  actionBtn: { borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 12 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Photo preview
  photoPreviewBox: { borderRadius: 12, overflow: 'hidden', marginBottom: 12, borderWidth: 1, borderColor: '#2a2a40' },
  photoPreview: { width: '100%', height: 180 },
  removePhotoBtn: { padding: 8, alignItems: 'center', backgroundColor: '#0f0f1a' },
  removePhotoText: { color: '#ff4757', fontWeight: '600', fontSize: 13 },

  // Location box
  locationBox: {
    backgroundColor: '#0f0f1a', borderRadius: 12, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#43D9A2',
  },
  locationBoxText: { color: '#43D9A2', fontWeight: '700', fontSize: 14, marginBottom: 4 },
  locationCoords: { color: '#555', fontSize: 11, marginBottom: 8 },

  // Submit
  submitBtn: { backgroundColor: '#6C63FF', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 15, paddingBottom: 10 },
});