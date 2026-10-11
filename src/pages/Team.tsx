import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { userService, type User } from '../services/userService';
import { isAdmin, getCurrentUserName } from '../utils/auth';
import { UserPlus, Trash2, Shield, User as UserIcon, Info } from 'lucide-react';

export function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await userService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load team users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    let email = username.trim();
    if (!email.includes('@')) {
      email = `${email}@gonextverse`;
    }
    if (!email.endsWith('@gonextverse')) {
      alert('Username must end with @gonextverse');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    setIsSaving(true);
    try {
      const success = await userService.createUser(email, password, role);
      if (success) {
        setUsername('');
        setPassword('');
        setIsAdding(false);
        await loadUsers();
      } else {
        alert('Failed to create employee. Username might already exist.');
      }
    } catch (err: any) {
      alert(`Error creating user: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name.toLowerCase() === getCurrentUserName().toLowerCase()) {
      alert("You cannot delete your own account.");
      return;
    }
    if (name.toLowerCase() === 'kishan' || name.toLowerCase() === 'shreyash') {
      alert("Founders Kishan and Shreyash cannot be removed.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${name}? This will revoke their CRM access.`)) {
      await userService.deleteUser(id);
      loadUsers();
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Shield className="w-12 h-12 text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-textSecondary mt-2">Only administrators can access team management.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-28 md:pb-10 max-w-full overflow-hidden">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-semibold text-textPrimary tracking-tight">Team Management</h1>
          <p className="text-textSecondary mt-0.5 text-[13px] md:text-[15px]">Manage staff members and their CRM roles.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'} className="h-11 rounded-xl">
          <UserPlus className="w-4 h-4 mr-2" />
          {isAdding ? 'Cancel' : 'Add Employee'}
        </Button>
      </div>

      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 text-xs sm:text-sm text-blue-900 flex items-start gap-3">
        <Info className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Role-Based Security Notice</p>
          <p className="text-blue-800/90 leading-relaxed">
            Administrator rights are enforced against database records. Employee accounts are created ready for Supabase Auth migration.
          </p>
        </div>
      </div>

      {isAdding && (
        <Card className="p-5 border border-primary/20 bg-primary/5">
          <h3 className="font-semibold mb-3 text-textPrimary">Create Employee Account</h3>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <Input 
              label="Username" 
              placeholder="name@gonextverse" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
            />
            <Input 
              label="Password" 
              type="text" 
              placeholder="Min 6 characters" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <Select 
              label="Role" 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              options={[
                { value: 'Employee', label: 'Employee' },
                { value: 'Admin', label: 'Admin' }
              ]} 
            />
            <Button type="submit" disabled={isSaving} isLoading={isSaving} className="h-[42px] mb-1">
              Create Account
            </Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-textSecondary text-sm">Loading team...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => {
            const shortName = u.username.split('@')[0];
            const isFounder = shortName.toLowerCase() === 'kishan' || shortName.toLowerCase() === 'shreyash';
            return (
              <Card key={u.id} className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {u.role === 'Admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-textPrimary text-sm truncate">{shortName}</p>
                    <p className="text-xs text-textSecondary flex items-center gap-1">
                      <span>{u.role}</span>
                      {isFounder && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-medium">Founder</span>}
                    </p>
                  </div>
                </div>
                {!isFounder && (
                  <button 
                    onClick={() => handleDelete(u.id, shortName)}
                    className="p-2.5 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                    title="Remove User"
                    aria-label={`Remove ${shortName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
