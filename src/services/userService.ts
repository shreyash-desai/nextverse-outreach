import { supabase } from '../config/supabase';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: string;
  createdAt: string;
}

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching users:', error); return []; }
    return data.map((row: any) => ({
      id: row.id,
      username: row.username,
      role: row.role,
      createdAt: row.created_at,
    }));
  },

  async createUser(username: string, password: string, role: string = 'Employee'): Promise<boolean> {
    const { error } = await supabase.from('users').insert({ username, password, role });
    if (error) { console.error('Error creating user:', error); return false; }
    return true;
  },

  async deleteUser(id: string): Promise<boolean> {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) { console.error('Error deleting user:', error); return false; }
    return true;
  }
};
