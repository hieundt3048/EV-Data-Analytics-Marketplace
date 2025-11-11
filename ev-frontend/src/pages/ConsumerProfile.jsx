import React, { useState, useEffect } from 'react';
import '../styles/consumer.css';

const ConsumerProfile = ({ fetchWithAuth }) => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    organization: '',
    industry: '',
    region: '',
    companySize: '',
    useCaseType: ''
  });
  
  const [options, setOptions] = useState({
    industries: [],
    regions: [],
    companySizes: [],
    useCaseTypes: []
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProfile();
    loadOptions();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await fetchWithAuth('/api/consumer/profile');
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile:', error);
      // Don't show error if it's just first time loading (no profile yet)
      // Just load with empty fields
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const data = await fetchWithAuth('/api/consumer/profile/demographics-options');
      if (data) {
        setOptions(data);
      }
    } catch (error) {
      console.error('Error loading options:', error);
      // Set default options if API fails
      setOptions({
        industries: [
          "OEM (Original Equipment Manufacturer)",
          "Automotive Startup",
          "Research Institution",
          "Fleet Management",
          "Energy Provider",
          "Insurance Company",
          "Government Agency",
          "Consulting Firm",
          "Technology Company",
          "Other"
        ],
        regions: [
          "North America",
          "Europe",
          "Asia Pacific",
          "Latin America",
          "Middle East & Africa",
          "Other"
        ],
        companySizes: [
          "Small (1-50 employees)",
          "Medium (51-500 employees)",
          "Large (501+ employees)",
          "Enterprise (5000+ employees)"
        ],
        useCaseTypes: [
          "Research & Development",
          "Market Analysis",
          "Product Development",
          "Fleet Operations",
          "Infrastructure Planning",
          "Policy Making",
          "Academic Research",
          "Other"
        ]
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Only send fields that can be updated (exclude id, email, etc.)
      const updates = {
        name: profile.name || '',
        organization: profile.organization || '',
        industry: profile.industry || '',
        region: profile.region || '',
        companySize: profile.companySize || '',
        useCaseType: profile.useCaseType || ''
      };
      
      const response = await fetchWithAuth('/api/consumer/profile', {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      if (response && response.success) {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully! Providers can now see your demographics in their dashboard.' 
        });
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Profile updated successfully!' 
        });
      }
      setSaving(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="consumer-profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="consumer-profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Update your profile information to help data providers understand their customer base better.</p>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        {/* Basic Information Section */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={profile.name || ''}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email (Cannot be changed)</label>
            <input
              type="email"
              id="email"
              name="email"
              value={profile.email || ''}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="organization">Organization</label>
            <input
              type="text"
              id="organization"
              name="organization"
              value={profile.organization || ''}
              onChange={handleChange}
              placeholder="e.g., Tesla Motors, MIT Research Lab"
            />
          </div>
        </section>

        {/* Demographics Section */}
        <section className="form-section demographics-section">
          <h2>Demographics (Optional but Recommended)</h2>
          <p className="section-description">
            <strong>Why provide this information?</strong><br/>
            Your demographics help data providers understand their customer base and improve their services.
            This information is aggregated and shown anonymously to providers (they won't see your individual details).
          </p>

          <div className="form-group">
            <label htmlFor="industry">Industry</label>
            <select
              id="industry"
              name="industry"
              value={profile.industry || ''}
              onChange={handleChange}
            >
              <option value="">-- Select Industry --</option>
              {options.industries.map((industry, idx) => (
                <option key={idx} value={industry}>{industry}</option>
              ))}
            </select>
            <small className="field-hint">What industry does your organization operate in?</small>
          </div>

          <div className="form-group">
            <label htmlFor="region">Region</label>
            <select
              id="region"
              name="region"
              value={profile.region || ''}
              onChange={handleChange}
            >
              <option value="">-- Select Region --</option>
              {options.regions.map((region, idx) => (
                <option key={idx} value={region}>{region}</option>
              ))}
            </select>
            <small className="field-hint">Your primary geographic region</small>
          </div>

          <div className="form-group">
            <label htmlFor="companySize">Company Size</label>
            <select
              id="companySize"
              name="companySize"
              value={profile.companySize || ''}
              onChange={handleChange}
            >
              <option value="">-- Select Company Size --</option>
              {options.companySizes.map((size, idx) => (
                <option key={idx} value={size}>{size}</option>
              ))}
            </select>
            <small className="field-hint">Number of employees in your organization</small>
          </div>

          <div className="form-group">
            <label htmlFor="useCaseType">Primary Use Case</label>
            <select
              id="useCaseType"
              name="useCaseType"
              value={profile.useCaseType || ''}
              onChange={handleChange}
            >
              <option value="">-- Select Use Case --</option>
              {options.useCaseTypes.map((useCase, idx) => (
                <option key={idx} value={useCase}>{useCase}</option>
              ))}
            </select>
            <small className="field-hint">How do you primarily use EV data?</small>
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsumerProfile;
