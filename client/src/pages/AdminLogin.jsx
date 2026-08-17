import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPass, setShowpass] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await axiosClient.post('/admin/login', credentials);
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminRole', data.role || 'Quản lý Admin'); 
        navigate('/admin');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Lỗi đăng nhập!');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#111', padding: '40px', borderRadius: '16px', border: '1px solid #333', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 0 30px rgba(212, 224, 46, 0.1)' }}>
        
        <h2 style={{ color: '#fff', letterSpacing: '3px', marginBottom: '30px' }}>
          APLUS <span style={{ color: '#d4e02e' }}>SYSTEM</span>
        </h2>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            type="text" 
            placeholder="Tài khoản Quản trị" 
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            style={{ padding: '15px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', fontSize: '16px' }}
            required
          />
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type={showPass ? "text" : "password"} // NẾU TRUE THÌ HIỆN CHỮ, FALSE THÌ HIỆN DẤU CHẤM
              placeholder="Mật khẩu" 
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              style={{ width: '100%', boxSizing: 'border-box', padding: '15px', paddingRight: '45px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '8px', fontSize: '16px' }}
              required
            />
            {/* NÚT BẤM CON MẮT */}
            <button 
              type="button" 
              onClick={() => setShowpass(!showPass)}
              style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', fontSize: '18px', display: 'flex' }}
            >
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" style={{ padding: '15px', background: '#d4e02e', color: '#000', fontWeight: 'bold', fontSize: '16px', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}>
            ĐĂNG NHẬP
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;