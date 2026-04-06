import { Package, Truck, Home, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import './DeliveryTracking.css';

const DeliveryTracking = ({ order }) => {
  if (!order.delivery_address) {
    return null;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending_payment':
        return <Clock size={20} />;
      case 'paid':
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
      paid: 'Processing',
      shipped: 'In Transit',
      delivered: 'Delivered',
      failed: 'Payment Failed',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending_payment':
        return 'pending';
      case 'paid':
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

  const statusSteps = ['pending_payment', 'paid', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="delivery-tracking">
      <div className="delivery-header">
        <Truck size={24} className="delivery-icon" />
        <div className="delivery-header-content">
          <h4>Delivery Details</h4>
          <p className={`status-badge status-${getStatusColor(order.status)}`}>
            {getStatusIcon(order.status)}
            {getStatusText(order.status)}
          </p>
        </div>
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
            <div className="timeline-label">
              {getStatusText(step).split(' ')[0]}
            </div>
            {index < statusSteps.length - 1 && (
              <div className="timeline-connector" />
            )}
          </div>
        ))}
      </div>

      <div className="delivery-address">
        <Home size={18} />
        <div className="address-content">
          <p className="address-label">Delivery Address</p>
          <p className="address-text">{order.delivery_address}</p>
          {order.delivery_method && (
            <p className="delivery-method">
              Method: <strong>{order.delivery_method}</strong>
            </p>
          )}
          {order.delivery_cost && (
            <p className="delivery-cost">
              Cost: <strong>KES {order.delivery_cost.toFixed(2)}</strong>
            </p>
          )}
          {order.estimated_delivery_date && (
            <p className="estimated-date">
              Est. Delivery: <strong>{new Date(order.estimated_delivery_date).toLocaleDateString()}</strong>
            </p>
          )}
        </div>
      </div>

      {order.mpesa_paid_at && (
        <div className="payment-info">
          <CheckCircle size={18} />
          <div>
            <p className="info-label">Payment Confirmed</p>
            <p className="info-text">
              {order.mpesa_receipt_number && `Receipt: ${order.mpesa_receipt_number}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component
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
