import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="dashboard" style={{
      minHeight: '100vh',
      padding: '100px 40px 40px',
      background: 'var(--cream, #faf8f5)'
    }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          fontFamily: 'var(--font-serif, "Cormorant Garamond", serif)',
          color: 'var(--gold, #9a8060)',
          marginBottom: '2rem',
          fontSize: '2.5rem'
        }}>
          Dashboard
        </h1>
        
        <div className="welcome-card" style={{
          background: 'linear-gradient(135deg, var(--gold, #9a8060) 0%, var(--gold-dark, #7a6050) 100%)',
          color: 'white',
          padding: '2rem',
          borderRadius: '16px',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2rem' }}>
            Welcome, {user?.firstName || 'User'}!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem', margin: 0 }}>
            You are logged in as: <strong style={{ textTransform: 'capitalize' }}>{user?.role || 'customer'}</strong>
          </p>
        </div>
        
        <div className="dashboard-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          <div className="dashboard-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(154,128,96,0.1)'
          }}>
            <h3 style={{
              color: 'var(--gold, #9a8060)',
              marginBottom: '1.5rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--light, #e8e4e0)'
            }}>
              <i className="fas fa-user-circle" style={{ marginRight: '10px' }}></i>
              Your Profile
            </h3>
            <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone || 'Not provided'}</p>
          </div>
          
          <div className="dashboard-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            border: '1px solid rgba(154,128,96,0.1)'
          }}>
            <h3 style={{
              color: 'var(--gold, #9a8060)',
              marginBottom: '1.5rem',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid var(--light, #e8e4e0)'
            }}>
              <i className="fas fa-bolt" style={{ marginRight: '10px' }}></i>
              Quick Actions
            </h3>
            <ul className="quick-actions" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '0.75rem' }}>
                <Link to="/services" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: 'var(--text, #3a3530)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  border: '1px solid transparent'
                }}>
                  <i className="fas fa-cut" style={{ marginRight: '10px', color: 'var(--gold)' }}></i>
                  Browse Services
                </Link>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <Link to="/booking" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: 'var(--text, #3a3530)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}>
                  <i className="fas fa-calendar-check" style={{ marginRight: '10px', color: 'var(--gold)' }}></i>
                  Book Appointment
                </Link>
              </li>
              <li style={{ marginBottom: '0.75rem' }}>
                <Link to="/profile" style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  color: 'var(--text, #3a3530)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  transition: 'all 0.3s'
                }}>
                  <i className="fas fa-edit" style={{ marginRight: '10px', color: 'var(--gold)' }}></i>
                  Edit Profile
                </Link>
              </li>
            </ul>
          </div>
          
          {user?.role === 'customer' && (
            <div className="dashboard-card" style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(154,128,96,0.1)'
            }}>
              <h3 style={{
                color: 'var(--gold, #9a8060)',
                marginBottom: '1.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--light, #e8e4e0)'
              }}>
                <i className="fas fa-star" style={{ marginRight: '10px' }}></i>
                Loyalty Points
              </h3>
              <p className="points" style={{
                fontSize: '3rem',
                fontWeight: 'bold',
                color: 'var(--gold, #9a8060)',
                textAlign: 'center',
                margin: '1rem 0'
              }}>
                {user?.customerProfile?.loyaltyPoints || 0}
              </p>
              <p style={{ textAlign: 'center', color: 'var(--muted, #8a7e78)' }}>
                Total Spent: R{user?.customerProfile?.totalSpent || 0}
              </p>
            </div>
          )}
          
          {user?.role === 'staff' && (
            <div className="dashboard-card" style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '16px',
              boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
              border: '1px solid rgba(154,128,96,0.1)'
            }}>
              <h3 style={{
                color: 'var(--gold, #9a8060)',
                marginBottom: '1.5rem',
                paddingBottom: '0.5rem',
                borderBottom: '2px solid var(--light, #e8e4e0)'
              }}>
                <i className="fas fa-briefcase" style={{ marginRight: '10px' }}></i>
                Staff Info
              </h3>
              <p><strong>Status:</strong> 
                <span style={{
                  marginLeft: '10px',
                  padding: '4px 12px',
                  background: user?.staffProfile?.status === 'active' ? '#d1fae5' : '#fef3c7',
                  color: user?.staffProfile?.status === 'active' ? '#065f46' : '#92400e',
                  borderRadius: '20px',
                  fontSize: '0.85rem'
                }}>
                  {user?.staffProfile?.status || 'active'}
                </span>
              </p>
              <p><strong>Specializations:</strong> {user?.staffProfile?.specializations?.join(', ') || 'None'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;