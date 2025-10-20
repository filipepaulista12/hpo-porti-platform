import React from 'react';
import { getRoleDisplayName } from '../utils/RoleHelpers';

interface UnauthorizedAccessProps {
  requiredRole: string;
  userRole: string;
  message: string;
}

const UnauthorizedAccess: React.FC<UnauthorizedAccessProps> = ({ 
  requiredRole, 
  userRole, 
  message 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '48px auto',
      textAlign: 'center'
    }}>
      <div style={{ 
        fontSize: '80px', 
        marginBottom: '24px',
        lineHeight: 1
      }}>
        🔒
      </div>
      
      <h2 style={{ 
        fontSize: '28px', 
        fontWeight: '700', 
        color: '#1f2937', 
        marginBottom: '16px',
        margin: '0 0 16px 0'
      }}>
        Acesso Restrito
      </h2>
      
      <p style={{ 
        fontSize: '16px', 
        color: '#6b7280', 
        marginBottom: '32px',
        lineHeight: '1.6',
        maxWidth: '480px'
      }}>
        {message}
      </p>
      
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        marginBottom: '32px',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Seu perfil:
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: '#111827',
            fontWeight: '700',
            backgroundColor: '#e5e7eb',
            padding: '4px 12px',
            borderRadius: '6px'
          }}>
            {getRoleDisplayName(userRole)}
          </span>
        </div>
        
        <div style={{
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '12px 0'
        }} />
        
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            fontWeight: '500'
          }}>
            Perfil necessário:
          </span>
          <span style={{ 
            fontSize: '14px', 
            color: '#111827',
            fontWeight: '700',
            backgroundColor: '#fef3c7',
            padding: '4px 12px',
            borderRadius: '6px'
          }}>
            {getRoleDisplayName(requiredRole)} ou superior
          </span>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
          }}
        >
          ← Voltar
        </button>
        
        <button
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 24px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '2px solid #e5e7eb',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#e5e7eb';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}
        >
          🏠 Início
        </button>
      </div>
      
      <p style={{
        marginTop: '32px',
        fontSize: '13px',
        color: '#9ca3af',
        fontStyle: 'italic'
      }}>
        💡 Entre em contato com um administrador se você acredita que deveria ter acesso a esta área.
      </p>
    </div>
  );
};

export default UnauthorizedAccess;
