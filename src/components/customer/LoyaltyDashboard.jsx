import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import '../../styles/loyalty.css';

const LoyaltyDashboard = () => {
  const { user } = useAuth();
  const [loyalty, setLoyalty] = useState(null);
  const [referralInfo, setReferralInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('visits');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchLoyaltyData();
  }, []);

  const fetchLoyaltyData = async () => {
    try {
      const [loyaltyRes, referralRes] = await Promise.all([
        api.get('/customer/loyalty'),
        api.get('/customer/loyalty/referral-info')
      ]);
      setLoyalty(loyaltyRes.data.data);
      setReferralInfo(referralRes.data.data);
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
      setMessage('Failed to load loyalty information');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReferralCode = async () => {
    if (!referralInfo?.referralCode) return;

    try {
      const code = referralInfo.referralCode;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.setAttribute('readonly', '');
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setMessage('Referral code copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Clipboard copy failed:', error);
      setMessage('Could not copy automatically. Please copy the code manually.');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return <div className="loyalty-loading"><i className="fas fa-spinner fa-spin"></i> Loading loyalty information...</div>;
  }

  return (
    <div className="loyalty-dashboard">
      <div className="loyalty-header">
        <h1>Your Loyalty Program</h1>
        <p>Earn rewards with every visit and referral!</p>
      </div>

      {message && <div className="loyalty-message success">{message}</div>}

      <div className="loyalty-tabs">
        <button 
          className={`loyalty-tab ${activeTab === 'visits' ? 'active' : ''}`}
          onClick={() => setActiveTab('visits')}
        >
          <i className="fas fa-calendar-check"></i> Visit Rewards
        </button>
        <button 
          className={`loyalty-tab ${activeTab === 'referral' ? 'active' : ''}`}
          onClick={() => setActiveTab('referral')}
        >
          <i className="fas fa-handshake"></i> Referral Program
        </button>
      </div>

      {/* VISIT REWARDS TAB */}
      {activeTab === 'visits' && (
        <div className="loyalty-content visits-content">
          <div className="visit-counter">
            <div className="counter-card">
              <div className="counter-number">{loyalty?.totalVisits || 0}</div>
              <div className="counter-label">Total Visits</div>
            </div>
          </div>

          <div className="rewards-grid">
            {/* 5th Visit Reward */}
            <div className={`reward-card ${loyalty?.fifthVisitReward.claimed ? 'claimed' : loyalty?.fifthVisitReward.eligible ? 'eligible' : ''}`}>
              <div className="reward-header">
                <i className="fas fa-star"></i>
                <span className="reward-name">5th Visit Reward</span>
              </div>
              <div className="reward-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min((loyalty?.totalVisits || 0) / 5 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {loyalty?.totalVisits || 0}/5 visits
                </div>
              </div>
              <div className="reward-benefit">
                <i className="fas fa-gift"></i>
                <span>50% OFF your next service</span>
              </div>
              <div className="reward-status">
                {loyalty?.fifthVisitReward.claimed ? (
                  <span className="status-claimed">✓ Claimed</span>
                ) : loyalty?.fifthVisitReward.eligible ? (
                  <span className="status-eligible">Ready to claim!</span>
                ) : (
                  <span className="status-progress">{5 - (loyalty?.totalVisits || 0)} visits to go</span>
                )}
              </div>
            </div>

            {/* 11th Visit Reward */}
            <div className={`reward-card ${loyalty?.eleventhVisitReward.claimed ? 'claimed' : loyalty?.eleventhVisitReward.eligible ? 'eligible' : ''}`}>
              <div className="reward-header">
                <i className="fas fa-crown"></i>
                <span className="reward-name">11th Visit Reward</span>
              </div>
              <div className="reward-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill premium" 
                    style={{ width: `${Math.min((loyalty?.totalVisits || 0) / 11 * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="progress-text">
                  {loyalty?.totalVisits || 0}/11 visits
                </div>
              </div>
              <div className="reward-benefit">
                <i className="fas fa-gift"></i>
                <span>FREE service (any service)</span>
              </div>
              <div className="reward-status">
                {loyalty?.eleventhVisitReward.claimed ? (
                  <span className="status-claimed">✓ Claimed</span>
                ) : loyalty?.eleventhVisitReward.eligible ? (
                  <span className="status-eligible">Ready to claim!</span>
                ) : (
                  <span className="status-progress">{Math.max(11 - (loyalty?.totalVisits || 0), 0)} visits to go</span>
                )}
              </div>
            </div>
          </div>

          <div className="loyalty-info-box">
            <h3>How Visit Rewards Work</h3>
            <ul>
              <li><strong>Every completed service</strong> counts as one visit</li>
              <li><strong>5th Visit:</strong> Get <strong>50% off</strong> your next service</li>
              <li><strong>11th Visit:</strong> Get a <strong>FREE service</strong> (any service)</li>
              <li>Rewards can only be redeemed once per milestone</li>
              <li>Rewards are applied at checkout</li>
            </ul>
          </div>
        </div>
      )}

      {/* REFERRAL PROGRAM TAB */}
      {activeTab === 'referral' && (
        <div className="loyalty-content referral-content">
          <div className="referral-header-card">
            <h2>Refer Friends & Earn Rewards</h2>
            <p>Help your friends discover our services and get rewarded!</p>
          </div>

          {/* Your Referral Code */}
          <div className="referral-code-section">
            <h3>Your Unique Referral Code</h3>
            <div className="code-display">
              <div className="code-box">
                <span className="code-value">{referralInfo?.referralCode}</span>
                <button 
                  className="btn btn-copy"
                  onClick={handleCopyReferralCode}
                  title="Copy code to clipboard"
                >
                  <i className="fas fa-copy"></i> Copy
                </button>
              </div>
              <p className="code-instruction">Share this code with friends to get them registered!</p>
            </div>
          </div>

          {/* Referral Reward Status */}
          <div className="referral-reward-card">
            <div className="reward-header">
              <i className="fas fa-handshake"></i>
              <h3>Referral Reward Status</h3>
            </div>
            
            <div className="referral-progress">
              <div className="progress-item">
                <div className="progress-label">
                  Qualified Referrals: <strong>{referralInfo?.referralRewardStatus.qualifiedCount || 0}/{referralInfo?.referralRewardStatus.requiredCount}</strong>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${Math.min((referralInfo?.referralRewardStatus.qualifiedCount || 0) / 3 * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="referral-benefit">
              <i className="fas fa-gift"></i>
              <h4>When you reach 3 qualified referrals:</h4>
              <p>Get your <strong>next treatment FREE</strong></p>
            </div>

            <div className="reward-requirement">
              <h4>What qualifies a referral?</h4>
              <ul>
                <li>Friend must sign up using your referral code</li>
                <li>Friend must complete a full service (R500+)</li>
                <li>Once both conditions are met, the referral is qualified</li>
              </ul>
            </div>

            <div className="referral-status">
              {referralInfo?.referralRewardStatus.claimed ? (
                <span className="status-claimed"><i className="fas fa-check-circle"></i> Reward Claimed</span>
              ) : referralInfo?.referralRewardStatus.requirementsMet ? (
                <span className="status-ready"><i className="fas fa-star"></i> Ready to Redeem!</span>
              ) : (
                <span className="status-progress"><i className="fas fa-hourglass"></i> {3 - (referralInfo?.referralRewardStatus.qualifiedCount || 0)} more referrals needed</span>
              )}
            </div>
          </div>

          {/* Referral List */}
          <div className="referral-list-section">
            <h3>Your Referrals</h3>
            {referralInfo?.referrals && referralInfo.referrals.length > 0 ? (
              <div className="referral-list">
                {referralInfo.referrals.map((referral) => (
                  <div 
                    key={referral.id} 
                    className={`referral-item ${referral.qualified ? 'qualified' : ''}`}
                  >
                    <div className="referral-info">
                      <div className="referral-name">
                        {referral.customerName}
                        {referral.qualified && <span className="qualified-badge">✓ Qualified</span>}
                      </div>
                      <div className="referral-details">
                        <span><i className="fas fa-calendar"></i> {new Date(referral.dateReferred).toLocaleDateString()}</span>
                        <span><i className="fas fa-shopping-bag"></i> R{referral.totalSpent.toFixed(2)} spent</span>
                      </div>
                    </div>
                    <div className="referral-status-badge">
                      {referral.qualified ? (
                        <span className="badge qualified"><i className="fas fa-check"></i> Qualified</span>
                      ) : (
                        <span className="badge pending"><i className="fas fa-clock"></i> Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-referrals">
                <i className="fas fa-user-friends"></i>
                <p>You haven't referred anyone yet.</p>
                <p>Share your referral code to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoyaltyDashboard;
