import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#050505',
      backgroundImage: 'radial-gradient(circle at center, rgba(212, 224, 46, 0.15) 0%, transparent 60%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ 
        fontSize: '100px', 
        margin: '0', 
        color: '#d4e02e', 
        textShadow: '0 0 30px rgba(212, 224, 46, 0.6)',
        lineHeight: '1'
      }}>
        404 Not Found
      </h1>
      
      <h2 style={{ 
        fontSize: '22px', 
        textTransform: 'uppercase', 
        letterSpacing: '2px', 
        marginBottom: '20px' 
      }}>
        Đường dẫn bạn truy cập không tồn tại hoặc đã bị xóa! <br />
        (The link you accessed does not exist or has been deleted!)
      </h2>
      
      <p style={{ 
        color: '#aaa', 
        fontSize: '15px', 
        maxWidth: '550px', 
        marginBottom: '40px', 
        lineHeight: '1.6' 
      }}>
        Xin lỗi bàn bạn truy cập không đúng, hoặc đường link bạn gõ không tồn tại trong hệ thống của APLUS. Vui lòng thử lại! <br />
        (Sorry, you've accessed the wrong site, or the link you entered doesn't exist in the APLUS system. Please try again!)
      </p>
      <Link to="/" style={{
        padding: '16px 35px',
        backgroundColor: 'transparent',
        color: '#d4e02e',
        border: '2px solid #d4e02e',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        transition: 'all 0.3s ease',
        boxShadow: '0 0 15px rgba(212, 224, 46, 0.2)'
      }}
      onMouseOver={(e) => { 
        e.target.style.backgroundColor = '#d4e02e'; 
        e.target.style.color = '#000';
        e.target.style.boxShadow = '0 0 30px rgba(212, 224, 46, 0.6)';
      }}
      onMouseOut={(e) => { 
        e.target.style.backgroundColor = 'transparent'; 
        e.target.style.color = '#d4e02e';
        e.target.style.boxShadow = '0 0 15px rgba(212, 224, 46, 0.2)';
      }}
      >
        VỀ TRANG CHỦ(GO TO HOMEPAGE)
      </Link>

    </div>
  );
};

export default NotFound;