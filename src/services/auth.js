import { supabase } from '../supabaseClient';

export const login = async (email, password) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim());

    if (error) {
      console.error(error);
      return { success: false, message: 'Error conectando al servidor.' };
    }

    const user = users && users.length > 0 ? users[0] : null;

    if (user && user.password === password) {
      localStorage.setItem('app_current_user', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, message: 'Credenciales inválidas.' };
  } catch (err) {
    return { success: false, message: 'Error inesperado.' };
  }
};

export const register = async (name, email, password) => {
  try {
    const { data: existingUser, error: existError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.trim());

    if (existingUser && existingUser.length > 0) {
      return { success: false, message: 'El correo ya está registrado.' };
    }

    const newUser = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim(),
      password: password,
      role: 'resident'
    };

    const { error: insertError } = await supabase
      .from('users')
      .insert([newUser]);

    if (insertError) {
      console.error(insertError);
      return { success: false, message: 'Error guardando usuario.' };
    }

    localStorage.setItem('app_current_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, message: 'Error inesperado.' };
  }
};

export const logout = async () => {
  await new Promise(r => setTimeout(r, 200));
  localStorage.removeItem('app_current_user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('app_current_user');
  return user ? JSON.parse(user) : null;
};
