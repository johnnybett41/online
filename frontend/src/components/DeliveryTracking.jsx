import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { Package, Truck, Home, CheckCircle, Clock, AlertCircle, RefreshCcw } from 'lucide-react';
import { useToast } from './Toast';
import './DeliveryTracking.css';

const REFRESH_INTERVAL = 15000;

const DeliveryTracking = ({ order }) => {
  const [liveOrder, setLiveOrder] = useState(order);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { showToast } = useToast();
  const lastStatusRef = useRef(order.status);
  const activeOrder = liveOrder || order;

  useEffect(() => {
    setLiveOrder(order);
    lastStatusRef.current = order.status;
  }, [order]);

  const getOrderDetails = async (signal) => {
    if (!order?.id) {
      return;
    }

    setIsRefreshing(true);

    try {
      const response = await axios.get(`/orders/${order.id}`, { signal });
      const nextOrder = response.data;

      setLiveOrder(nextOrder);
      setLastUpdated(new Date());

      if (lastStatusRef.current && nextOrder.status !== lastStatusRef.current) {
        showToast(`Order #${order.id} status updated to ${getStatusText(nextOrder.status)}.`, 'info');
      }

      lastStatusRef.current = nextOrder.status;
    } catch (error) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Failed to refresh delivery tracking:', error);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    getOrderDetails(controller.signal);

    const status = order?.status || liveOrder?.status;
    const shouldPoll = !['delivered', 'failed'].includes(status);

    if (!shouldPoll) {
      return () => controller.abort();
    }

    const intervalId = window.setInterval(() => {
      getOrderDetails(controller.signal);
    }, REFRESH_INTERVAL);

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id, activeOrder.status]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment':
      case 'payment_initiated':
      case 'pending_confirmation':
        return <Clock size={20} />;
      case 'paid':
      case 'processing':
        return <Package size={20} />;
      case 'shipped':
        return <Truck size={20} />;
      case 'delivered':
        return <CheckCircle size={20} />;
      case 'failed':
        return <AlertCircle size={20} />;
      default:
        return <Clock size={20} />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending_payment: 'Awaiting Payment',
      payment_initiated: 'Payment Started',
      pending_confirmation: 'Awaiting Confirmation',
      processing: 'Processing',
      paid: 'Paid',
      shipped: 'In Transit',
      delivered: 'Delivered',
      failed: 'Payment Failed',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
      case 'payment_initiated':
      case 'pending_confirmation':
        return 'pending';
      case 'paid':
      case 'processing':
        return 'processing';
      case 'shipped':
        return 'shipping';
      case 'delivered':
        return 'delivered';
      case 'failed':
        return 'failed';
      default:
        return 'pending';
    }
  };

  const statusSteps = useMemo(
    () => ['pending_payment', 'payment_initiated', 'paid', 'shipped', 'delivered'],
    []
  );
  const currentStepIndex = Math.max(
    0,
    statusSteps.indexOf(activeOrder.status)
  );

  if (!activeOrder.delivery_address) {
    return null;
  }

  return (
    <div className="delivery-tracking">
      <div className="delivery-header">
        <Truck size={24} className="delivery-icon" />
        <div className="delivery-header-content">
          <h4>Delivery Details</h4>
          <p className={`status-badge status-${getStatusColor(activeOrder.status)}`}>
            {getStatusIcon(activeOrder.status)}
            {getStatusText(activeOrder.status)}
          </p>
        </div>

        <button
          type="button"
          className="tracking-refresh"
          onClick={() => getOrderDetails()}
          disabled={isRefreshing}
          aria-label="Refresh delivery status"
        >
          <RefreshCcw size={16} className={isRefreshing ? 'spinning' : ''} />
          <span>{isRefreshing ? 'Refreshing' : 'Live'}</span>
        </button>
      </div>

      <div className="delivery-timeline">
        {statusSteps.map((step, index) => (
          <div
            key={step}
            className={`timeline-step ${
              index <= currentStepIndex ? 'completed' : ''
            } ${index === currentStepIndex ? 'active' : ''}`}
          >
            <div className="timeline-marker">
              {index < currentStepIndex ? (
                <CheckCircle size={24} />
              ) : index === currentStepIndex ? (
                <Clock size={24} />
              ) : (
                <Circle size={24} />
              )}
            </div>
            <div className="timeline-label">{getStatusText(step).split(' ')[0]}</div>
            {index < statusSteps.length - 1 && <div className="timeline-connector" />}
          </div>
        ))}
      </div>

      <div className="delivery-address">
        <Home size={18} />
        <div className="address-content">
          <p className="address-label">Delivery Address</p>
          <p className="address-text">{activeOrder.delivery_address}</p>
          {activeOrder.delivery_method && (
            <p className="delivery-method">
              Method: <strong>{activeOrder.delivery_method}</strong>
            </p>
          )}
          {activeOrder.delivery_cost !== undefined && activeOrder.delivery_cost !== null && (
            <p className="delivery-cost">
              Cost: <strong>KES {Number(activeOrder.delivery_cost).toFixed(2)}</strong>
            </p>
          )}
          {activeOrder.estimated_delivery_date && (
            <p className="estimated-date">
              Est. Delivery:{' '}
              <strong>{new Date(activeOrder.estimated_delivery_date).toLocaleDateString()}</strong>
            </p>
          )}
        </div>
      </div>

      {activeOrder.mpesa_paid_at && (
        <div className="payment-info">
          <CheckCircle size={18} />
          <div>
            <p className="info-label">Payment Confirmed</p>
            <p className="info-text">
              {activeOrder.mpesa_receipt_number && `Receipt: ${activeOrder.mpesa_receipt_number}`}
            </p>
          </div>
        </div>
      )}

      {lastUpdated && (
        <p className="tracking-updated">
          Last updated {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

const Circle = ({ size = 24, ...props }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: '2px solid currentColor',
      opacity: 0.3,
    }}
    {...props}
  />
);

export default DeliveryTracking;
