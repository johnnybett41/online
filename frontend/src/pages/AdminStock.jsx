import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AdminStock.css';

const AdminStock = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [draftStock, setDraftStock] = useState({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const res = await axios.get('/admin/stock');
      setProducts(res.data);
      setDraftStock(
        res.data.reduce((acc, product) => {
          acc[product.id] = product.stock_quantity;
          return acc;
        }, {})
      );
    } catch (requestError) {
      const message = requestError?.response?.data?.message || 'Unable to load stock data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = (productId, value) => {
    setDraftStock((current) => ({
      ...current,
      [productId]: value,
    }));
  };

  const patchStock = async (productId, quantity) => {
    setSavingId(productId);
    setError('');

    try {
      const res = await axios.patch(`/admin/products/${productId}/stock`, {
        stock_quantity: Number.parseInt(quantity, 10),
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, stock_quantity: res.data.stock_quantity, stock_status: res.data.stock_quantity <= 0 ? 'sold_out' : res.data.stock_quantity <= 5 ? 'low_stock' : 'in_stock' }
            : product
        )
      );
      updateDraft(productId, res.data.stock_quantity);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to update stock');
    } finally {
      setSavingId(null);
    }
  };

  const restockProduct = async (productId, amount) => {
    setSavingId(productId);
    setError('');

    try {
      const res = await axios.post(`/admin/products/${productId}/restock`, {
        quantity: amount,
      });

      setProducts((current) =>
        current.map((product) =>
          product.id === productId
            ? { ...product, stock_quantity: res.data.stock_quantity, stock_status: res.data.stock_quantity <= 0 ? 'sold_out' : res.data.stock_quantity <= 5 ? 'low_stock' : 'in_stock' }
            : product
        )
      );
      updateDraft(productId, res.data.stock_quantity);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to restock product');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter((product) => {
    const needle = search.toLowerCase();
    return (
      product.name.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle)
    );
  });

  const summary = {
    total: products.reduce((sum, product) => sum + Math.max(0, Number(product.stock_quantity || 0)), 0),
    low: products.filter((product) => Number(product.stock_quantity || 0) > 0 && Number(product.stock_quantity || 0) <= 5).length,
    soldOut: products.filter((product) => Number(product.stock_quantity || 0) <= 0).length,
  };

  if (loading) {
    return (
      <div className="admin-stock-page">
        <div className="admin-stock-shell">Loading stock manager...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-stock-page">
        <div className="admin-stock-shell">
          <h1>Stock Manager</h1>
          <p>Please log in first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-stock-page">
      <div className="admin-stock-shell">
        <div className="admin-stock-hero">
          <div>
            <span className="admin-kicker">Admin stock editor</span>
            <h1>Restock products from inside the app</h1>
            <p>Update quantities, add a quick restock, and keep the storefront counts accurate.</p>
          </div>
          <div className="admin-summary-grid">
            <div className="admin-summary-card">
              <strong>{summary.total}</strong>
              <span>items remaining</span>
            </div>
            <div className="admin-summary-card">
              <strong>{summary.low}</strong>
              <span>low stock</span>
            </div>
            <div className="admin-summary-card">
              <strong>{summary.soldOut}</strong>
              <span>sold out</span>
            </div>
          </div>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-toolbar">
          <input
            type="search"
            placeholder="Search by product or category"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-stock-list">
          {filteredProducts.map((product) => {
            const stockValue = Number(draftStock[product.id] ?? product.stock_quantity ?? 0);
            const statusClass = stockValue <= 0 ? 'sold-out' : stockValue <= 5 ? 'low-stock' : 'in-stock';

            return (
              <article key={product.id} className="admin-stock-card">
                <img src={product.image} alt={product.name} />
                <div className="admin-stock-copy">
                  <div className="admin-stock-topline">
                    <div>
                      <span className={`admin-status ${statusClass}`}>{product.stock_status}</span>
                      <h3>{product.name}</h3>
                      <p>{product.category}</p>
                    </div>
                    <strong>KES {product.price}</strong>
                  </div>

                  <div className="admin-stock-actions">
                    <label>
                      Set stock
                      <input
                        type="number"
                        min="0"
                        value={stockValue}
                        onChange={(e) => updateDraft(product.id, e.target.value)}
                      />
                    </label>
                    <div className="admin-action-row">
                      <button type="button" onClick={() => restockProduct(product.id, 5)} disabled={savingId === product.id}>
                        +5
                      </button>
                      <button type="button" onClick={() => restockProduct(product.id, 10)} disabled={savingId === product.id}>
                        +10
                      </button>
                      <button
                        type="button"
                        className="primary"
                        onClick={() => patchStock(product.id, stockValue)}
                        disabled={savingId === product.id}
                      >
                        {savingId === product.id ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminStock;
