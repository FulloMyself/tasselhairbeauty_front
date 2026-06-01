import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const LoyaltyCard = () => {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get('/customer/loyalty');
      setLoyalty(response.data.data);
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !loyalty) {
    return (
      <div className="loyalty-card loading">
        <i className="fas fa-spinner fa-spin"></i> Loading...
      </div>
    );
  }

  const visits = loyalty.totalVisits || 0;
  const nextReward5th = visits < 5;
  const nextReward11th = visits >= 5 && visits < 11;
  const nextRewardReferral = !loyalty.referralReward.claimed;

  return (
    <div className="loyalty-card">
      <div className="loyalty-card-header">
        <i className="fas fa-star"></i>
        <h3>Loyalty Program</h3>
        <Link to="/loyalty" className="loyalty-card-link">
          <i className="fas fa-arrow-right"></i>
        </Link>
      </div>

      <div className="loyalty-card-body">
        {/* Visit Counter */}
        <div className="loyalty-section">
          <div className="loyalty-title">
            <i className="fas fa-calendar-check"></i>
            <span>Visit Rewards</span>
          </div>
          <div className="loyalty-progress">
            {nextReward5th && (
              <>
                <div className="progress-item">
                  <span>{visits}/5 to 50% OFF</span>
                  <div className="mini-progress">
                    <div className="mini-fill" style={{ width: `${(visits / 5) * 100}%` }}></div>
                  </div>
                </div>
              </>
            )}
            {nextReward11th && (
              <>
                <div className="progress-item">
                  <span>50% OFF ✓ Claimed</span>
                </div>
                <div className="progress-item">
                  <span>{visits}/11 to FREE service</span>
                  <div className="mini-progress">
                    <div className="mini-fill" style={{ width: `${(visits / 11) * 100}%` }}></div>
                  </div>
                </div>
              </>
            )}
            {!nextReward5th && !nextReward11th && (
              <>
                <div className="progress-item claimed">
                  <span>50% OFF ✓</span>
                </div>
                <div className="progress-item claimed">
                  <span>FREE Service ✓</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Referral Summary */}
        <div className="loyalty-section">
          <div className="loyalty-title">
            <i className="fas fa-handshake"></i>
            <span>Referral Reward</span>
          </div>
          <div className="loyalty-referral">
            <div className="referral-stat">
              <span className="stat-label">Total Referrals</span>
              <span className="stat-value">{loyalty.referralsCount || 0}</span>
            </div>
            <div className="referral-stat">
              <span className="stat-label">Qualified Referrals</span>
              <span className="stat-value">{loyalty.referralReward.qualifiedReferrals || 0}/3</span>
            </div>
            {nextRewardReferral && (
              <div className="referral-badge">
                Refer 3 customers → Free treatment
              </div>
            )}
            {loyalty.referralReward.claimed && (
              <div className="referral-badge claimed">
                ✓ Reward Claimed
              </div>
            )}
          </div>
        </div>
      </div>

      <Link to="/loyalty" className="loyalty-card-footer">
        <span>View Full Details</span>
        <i className="fas fa-chevron-right"></i>
      </Link>
    </div>
  );
};

export default LoyaltyCard;
