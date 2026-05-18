import { useEffect, useState } from 'react';
import {
  appUsers,
  AppUser,
  getLoginActivityLog,
  toggleUserBlocked,
  addLoginActivity,
  LoginActivity,
  subscribeLoginActivityChanges,
  unsubscribeLoginActivityChanges,
} from '../data/mockData';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../lib/supabase';

export function UserManagementPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [recentLogs, setRecentLogs] = useState<LoginActivity[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setUsers(appUsers);
      setRecentLogs(getLoginActivityLog());
      setLoading(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleLoginActivityUpdate = () => setRecentLogs(getLoginActivityLog());
    subscribeLoginActivityChanges(handleLoginActivityUpdate);
    return () => unsubscribeLoginActivityChanges(handleLoginActivityUpdate);
  }, []);

  const { isAdmin, isSuperAdmin, currentUser } = useAuth();

  const handleToggle = (user: AppUser) => {
    const isAdminToAdmin = isAdmin && !isSuperAdmin && user.user_type === 'ADMIN';
    if (user.user_type === 'SUPERADMIN' || isAdminToAdmin) {
      return;
    }

    setUsers((current) =>
      current.map((item) =>
        item.id === user.id
          ? {
              ...item,
              record_status: item.record_status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
            }
          : item
      )
    );
    setToast(`User ${user.username} has been ${user.record_status === 'ACTIVE' ? 'deactivated' : 'activated'}.`);
    window.setTimeout(() => setToast(null), 2800);
  };

  const [processingIds, setProcessingIds] = useState<number[]>([]);

  const handleToggleAdmin = async (user: AppUser) => {
    if (!isSuperAdmin) return;
    if (user.user_type === 'SUPERADMIN') return;

    // optimistic update
    const newType = user.user_type === 'ADMIN' ? 'USER' : 'ADMIN';
    setUsers((current) =>
      current.map((item) => (item.id === user.id ? { ...item, user_type: newType } : item))
    );
    setProcessingIds((s) => [...s, user.id]);

    try {
      // try to locate the app_user by email (fallback to username)
      const email = user.username.includes('@') ? user.username : user.username;

      const { data: appUser, error: userErr } = await supabase
        .from('app_user')
        .select('id,auth_id,email')
        .eq('email', email)
        .maybeSingle();

      if (userErr || !appUser) throw new Error(userErr?.message || 'app_user not found');

      const { data: admModule, error: mErr } = await supabase
        .from('app_module')
        .select('id')
        .eq('code', 'Adm_Mod')
        .maybeSingle();

      if (mErr || !admModule) throw new Error(mErr?.message || 'Admin module not found');

      const { data: admRight, error: rErr } = await supabase
        .from('rights')
        .select('id')
        .eq('code', 'ADM_USER')
        .maybeSingle();

      if (rErr || !admRight) throw new Error(rErr?.message || 'ADM_USER right not found');

      const { data: userModuleData, error: umErr } = await supabase
        .from('user_module')
        .select('id')
        .eq('user_id', appUser.id)
        .eq('module_id', admModule.id)
        .maybeSingle();

      if (umErr) throw new Error(umErr.message);

      let userModuleId: number | null = userModuleData?.id ?? null;

      if (!userModuleId) {
        // create user_module linking
        const { data: created, error: createErr } = await supabase
          .from('user_module')
          .insert({ user_id: appUser.id, module_id: admModule.id })
          .select()
          .maybeSingle();
        if (createErr || !created) throw new Error(createErr?.message || 'failed to create user_module');
        // @ts-ignore -- created will contain id
        userModuleId = created.id;
      }

      // upsert user_module_rights for ADM_USER
      const canValue = newType === 'ADMIN';

      // update existing user_module_rights if exists, else insert
      const { data: existing, error: exErr } = await supabase
        .from('user_module_rights')
        .select('id')
        .eq('user_module_id', userModuleId)
        .eq('rights_id', admRight.id)
        .maybeSingle();

      if (exErr) throw new Error(exErr.message);

      if (existing) {
        const { error: updErr } = await supabase
          .from('user_module_rights')
          .update({ can: canValue })
          .eq('id', existing.id);
        if (updErr) throw new Error(updErr.message);
      } else {
        const { error: insErr } = await supabase
          .from('user_module_rights')
          .insert({ user_module_id: userModuleId, rights_id: admRight.id, can: canValue });
        if (insErr) throw new Error(insErr.message);
      }

      setToast(`User ${user.username} is now ${newType}.`);
    } catch (err: any) {
      // revert optimistic update
      setUsers((current) => current.map((item) => (item.id === user.id ? { ...item, user_type: user.user_type } : item)));
      setToast(err?.message || 'Failed to update user role.');
    } finally {
      setProcessingIds((s) => s.filter((id) => id !== user.id));
      window.setTimeout(() => setToast(null), 3000);
    }
  };

  const handleBlockToggle = (user: AppUser) => {
    const updatedUser = toggleUserBlocked(user.id, !user.blocked);
    if (!updatedUser) return;

    setUsers((current) =>
      current.map((item) => (item.id === updatedUser.id ? updatedUser : item))
    );

    addLoginActivity({
      userId: updatedUser.id,
      username: updatedUser.email,
      user_type: updatedUser.user_type,
      action: updatedUser.blocked ? 'Blocked' : 'Unblocked',
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
    });
    setRecentLogs(getLoginActivityLog());
    setToast(`User ${updatedUser.username} has been ${updatedUser.blocked ? 'blocked' : 'unblocked'}.`);
    window.setTimeout(() => setToast(null), 2800);
  };

  return (
    <section className="page-panel">
      <div className="page-panel__header">
        <h1>User Management</h1>
        <p className="text-muted">Manage your users and update account activation status.</p>
      </div>

      {toast ? <div className="toast toast--success">{toast}</div> : null}

      {loading ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(4)].map((_, index) => (
                <tr key={index} className="skeleton-row">
                  <td colSpan={4}>
                    <div className="skeleton-row__content" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">No user records available.</div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>User Type</th>
                <th>Record Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={user.user_type === 'SUPERADMIN' ? 'table-row--inactive' : ''}
                >
                  <td>
                    <strong>{user.fullName}</strong>
                    <div className="text-muted">{user.username}</div>
                  </td>
                  <td>{user.user_type}</td>
                  <td>
                    <span className={`status-chip status-chip--${user.record_status.toLowerCase()}`}>
                      {user.record_status}
                    </span>
                    {user.blocked && (
                      <span
                        style={{
                          marginLeft: 8,
                          padding: '0.2rem 0.4rem',
                          borderRadius: 4,
                          backgroundColor: '#fbbf24',
                          color: '#1f2937',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        BLOCKED
                      </span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        className="button button--ghost"
                        disabled={
                          user.user_type === 'SUPERADMIN' ||
                          (isAdmin && !isSuperAdmin && user.user_type === 'ADMIN')
                        }
                        title={
                          user.user_type === 'SUPERADMIN'
                            ? 'SUPERADMIN accounts cannot be modified'
                            : isAdmin && !isSuperAdmin && user.user_type === 'ADMIN'
                            ? 'Only SUPERADMIN can deactivate other admins'
                            : undefined
                        }
                        onClick={() => handleToggle(user)}
                        style={{
                          opacity:
                            user.user_type === 'SUPERADMIN' ||
                            (isAdmin && !isSuperAdmin && user.user_type === 'ADMIN')
                              ? 0.6
                              : 1,
                        }}
                      >
                        {user.record_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>

                      {isSuperAdmin && (
                        <button
                          className="button button--ghost"
                          disabled={user.user_type === 'SUPERADMIN'}
                          onClick={() => handleToggleAdmin(user)}
                          title={
                            user.user_type === 'SUPERADMIN'
                              ? 'SUPERADMIN accounts cannot be modified'
                              : user.user_type === 'ADMIN'
                              ? 'Revoke admin rights'
                              : 'Grant admin rights'
                          }
                          style={{ opacity: user.user_type === 'SUPERADMIN' ? 0.6 : 1 }}
                        >
                          {user.user_type === 'ADMIN' ? 'Revoke Admin' : 'Make Admin'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(isAdmin || isSuperAdmin) && (
          <div style={{ marginTop: '2rem' }}>
            <div className="page-panel__header">
              <h2>Recent Log User</h2>
              <p className="text-muted">
                Only admins and superadmins can view recent login activity and block user activity.
              </p>
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>Time</th>
                    <th>Control</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLogs.map((log) => {
                    const targetUser = users.find((u) => u.id === log.userId);
                    const canManage =
                      isSuperAdmin || (log.user_type !== 'SUPERADMIN' && targetUser?.user_type !== 'SUPERADMIN');

                    return (
                      <tr key={log.id}>
                        <td>{log.username}</td>
                        <td>{log.user_type}</td>
                        <td>{log.action}</td>
                        <td>{log.status}</td>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>
                          {targetUser ? (
                            <button
                              className="button button--ghost"
                              disabled={!canManage}
                              onClick={() => handleBlockToggle(targetUser)}
                              title={
                                !canManage
                                  ? 'Only SUPERADMIN can manage SUPERADMIN activity'
                                  : targetUser.blocked
                                  ? 'Unblock user activity'
                                  : 'Block user activity'
                              }
                              style={{ opacity: canManage ? 1 : 0.6 }}
                            >
                              {targetUser.blocked ? 'Unblock' : 'Block'}
                            </button>
                          ) : (
                            <span className="text-muted">No user record</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </>
      )}
    </section>
  );
}
