import React from 'react';

interface MemberFiltersProps {
  userFirstNameFilter: string;
  userLastNameFilter: string;
  userTelegramUsernameFilter: string;
  userCountryFilter: string;
  setUserFirstNameFilter: (value: string) => void;
  setUserLastNameFilter: (value: string) => void;
  setUserTelegramUsernameFilter: (value: string) => void;
  setUserCountryFilter: (value: string) => void;
}

const MemberFilters: React.FC<MemberFiltersProps> = ({
  userFirstNameFilter,
  userLastNameFilter,
  userTelegramUsernameFilter,
  userCountryFilter,
  setUserFirstNameFilter,
  setUserLastNameFilter,
  setUserTelegramUsernameFilter,
  setUserCountryFilter,
}) => {
  return (
    <>
      <th className="admin-table-header-cell">
        First Name
        <input
          type="text"
          placeholder="Filter First Name"
          value={userFirstNameFilter}
          onChange={(e) => setUserFirstNameFilter(e.target.value)}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Last Name
        <input
          type="text"
          placeholder="Filter Last Name"
          value={userLastNameFilter}
          onChange={(e) => setUserLastNameFilter(e.target.value)}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Telegram Username
        <input
          type="text"
          placeholder="Filter Telegram Username"
          value={userTelegramUsernameFilter}
          onChange={(e) => setUserTelegramUsernameFilter(e.target.value)}
          className="admin-input"
        />
      </th>
      <th className="admin-table-header-cell">
        Country
        <input
          type="text"
          placeholder="Filter Country"
          value={userCountryFilter}
          onChange={(e) => setUserCountryFilter(e.target.value)}
          className="admin-input"
        />
      </th>
    </>
  );
};

export default MemberFilters;
