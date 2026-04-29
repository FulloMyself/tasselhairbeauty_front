import React from 'react';
import ServiceBrowser from '../../components/customer/ServiceBrowser';

const ServicePage = () => {
  return (
    <div className="page-content service-page">
      <div className="page-header">
        <h1>Book a Service</h1>
        <p>Browse our services and send your booking request through WhatsApp.</p>
      </div>
      <ServiceBrowser />
    </div>
  );
};

export default ServicePage;
