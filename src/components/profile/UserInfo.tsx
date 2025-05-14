import React from 'react';

interface UserInfoProps {
  user: any;
  handleEditProfile: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, handleEditProfile }) => {
  return (
    <div className="user-info-summary">
      <div className="user-info-card">
        <h3 className="user-info-title">Personal Information</h3>
        <p><strong>First Name:</strong> {user?.first_name}</p>
        <p><strong>Last Name:</strong> {user?.last_name}</p>
        <p><strong>Telegram Username:</strong> {user?.telegram_username}</p>
        <p><strong>Country:</strong> {user?.country}</p>
        <button 
          onClick={handleEditProfile}
          className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 mt-4"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default UserInfo;
