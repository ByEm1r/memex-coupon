import React from 'react';
import { Loader2 } from 'lucide-react';

interface MemberTableProps {
  users: any[];
  usersLoading: boolean;
  editingUserId: string | null;
  userFormData: any;
  handleUserInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => void;
  handleUpdateUser: (e: React.FormEvent, id: string) => Promise<void>;
  handleCancelUserEdit: () => void;
  handleStartUserEditing: (user: any) => void;
  handleDeleteUser: (id: string) => Promise<void>;
  filteredUsers: any[];
}

const MemberTable: React.FC<MemberTableProps> = ({
  users,
  usersLoading,
  editingUserId,
  userFormData,
  handleUserInputChange,
  handleUpdateUser,
  handleCancelUserEdit,
  handleStartUserEditing,
  handleDeleteUser,
  filteredUsers,
}) => {
  return (
    <tbody className="admin-table-body">
      {usersLoading ? (
        <tr>
          <td colSpan={5} className="text-center py-4">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 inline-block" />
          </td>
        </tr>
      ) : (
        filteredUsers.map((user) => (
          <tr key={user.id} className="admin-table-row">
            {editingUserId === user.id ? (
              <>
                <td className="admin-table-cell">
                  <input
                    type="text"
                    name="first_name"
                    value={userFormData.first_name}
                    onChange={(e) => handleUserInputChange(e, 'first_name')}
                    className="admin-input"
                  />
                </td>
                <td className="admin-table-cell">
                  <input
                    type="text"
                    name="last_name"
                    value={userFormData.last_name}
                    onChange={(e) => handleUserInputChange(e, 'last_name')}
                    className="admin-input"
                  />
                </td>
                <td className="admin-table-cell">
                  <input
                    type="text"
                    name="telegram_username"
                    value={userFormData.telegram_username}
                    onChange={(e) => handleUserInputChange(e, 'telegram_username')}
                    className="admin-input"
                  />
                </td>
                <td className="admin-table-cell">
                  <input
                    type="text"
                    name="country"
                    value={userFormData.country}
                    onChange={(e) => handleUserInputChange(e, 'country')}
                    className="admin-input"
                  />
                </td>
                <td className="admin-table-cell admin-table-actions">
                  <button
                    onClick={(e) => handleUpdateUser(e, user.id)}
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelUserEdit}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </td>
              </>
            ) : (
              <>
                <td className="admin-table-cell">{user.first_name}</td>
                <td className="admin-table-cell">{user.last_name}</td>
                <td className="admin-table-cell">
                  <a
                    href={`https://t.me/${user.telegram_username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.telegram_username}
                  </a>
                </td>
                <td className="admin-table-cell">{user.country}</td>
                <td className="admin-table-cell admin-table-actions">
                  <button
                    onClick={() => handleStartUserEditing(user)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </>
            )}
          </tr>
        ))
      )}
    </tbody>
  );
};

export default MemberTable;
