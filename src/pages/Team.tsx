import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { userService, type User } from '../services/userService';
import { isAdmin, getCurrentUserName } from '../utils/auth';
import { UserPlus, Trash2, Shield, User as UserIcon } from 'lucide-react';

export function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const data = await userService.getUsers();
    setUsers(data);
    setIsLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.includes('@gonextverse')) {
      alert('Username must end with @gonextverse');
      return;
    }
    const success = await userService.createUser(username, password, role);
    if (success) {
      setUsername('');
      setPassword('');
      setIsAdding(false);
      loadUsers();
    } else {
      alert('Failed to create user. Username might already exist.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (name === getCurrentUserName()) {
      alert("You cannot delete yourself.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
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
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between pt-4">
        <div>
          <h1 className="text-[22px] md:text-[28px] font-semibold text-textPrimary tracking-tight">Team Management</h1>
          <p className="text-textSecondary mt-0.5 text-[13px] md:text-[15px]">Manage access to the CRM.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? 'secondary' : 'primary'} className="h-10">
          <UserPlus className="w-4 h-4 mr-2" />
          {isAdding ? 'Cancel' : 'Add User'}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-5 border border-primary/20 bg-primary/5">
          <h3 className="font-semibold mb-4">Create New User</h3>
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
              placeholder="Password123" 
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
            <Button type="submit" className="h-[42px] mb-1">Create Account</Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <p className="text-center py-10 text-textSecondary">Loading team...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(u => (
            <Card key={u.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                  {u.role === 'Admin' ? <Shield className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-textPrimary text-sm">{u.username.split('@')[0]}</p>
                  <p className="text-xs text-textSecondary">{u.role}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(u.id, u.username.split('@')[0])}
                className="p-2 text-textMuted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove User"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
