import React from 'react';
import { Card } from 'react-bootstrap';
import { Phone, MapPin, Award, Users, Briefcase, User } from 'react-feather';
import { Link } from 'react-router-dom';
import TopographeActions from './TopographeActions';
import { Topographe } from '../types';

interface TopographeMobileCardProps {
  user: Topographe;
  onUserAction?: (action: string, userId: number) => void;
}

const getStatusBadge = (isActive: boolean) => {
  return isActive ? (
    <small style={{ backgroundColor: '#28a745', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>• Actif</small>
  ) : (
    <small style={{ backgroundColor: 'red', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>• Inactif</small>
  );
};

const getAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE'
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

const TopographeMobileCard: React.FC<TopographeMobileCardProps> = ({ user, onUserAction }) => {
  const avatarColor = getAvatarColor(`${user.firstName} ${user.lastName}`);
  const initials = getInitials(`${user.firstName} ${user.lastName}`);

  const cardStyle: React.CSSProperties = {
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    border: '1px solid #dee2e6'
  };

  const badgeStyle: React.CSSProperties = {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    fontWeight: '500',
    letterSpacing: '0.025em'
  };

  return (
    <Card style={cardStyle} className="mb-3">
      <Card.Body style={{ padding: '1rem' }}>
        {/* Header avec avatar et nom */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Link 
            to={`/topographes/${user.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                backgroundColor: avatarColor,
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {initials}
            </div>
          </Link>
          <div style={{ flexGrow: 1 }}>
            <h6 style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
              <Link 
                to={`/topographes/${user.id}`}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#007bff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
              >
                {user.firstName} {user.lastName}
              </Link>
            </h6>
            <p style={{ marginBottom: '0.25rem', color: '#6c757d', fontSize: '0.875rem' }}>
              <a 
                href={`mailto:${user.email}`}
                style={{ color: '#6c757d', textDecoration: 'none' }}
              >
                {user.email}
              </a>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getStatusBadge(user.isActive)}
              <small style={{ color: '#6c757d' }}>#{user.username}</small>
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <Award size="14px" style={{ marginRight: '0.5rem' }} />
            <span>{user.licenseNumber}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <Phone size="14px" style={{ marginRight: '0.5rem' }} />
            <a 
              href={`tel:${user.phoneNumber}`}
              style={{ color: '#6c757d', textDecoration: 'none' }}
            >
              {user.phoneNumber}
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem', gridColumn: '1 / -1' }}>
            <MapPin size="14px" style={{ marginRight: '0.5rem' }} />
            <span>{user.cityName}</span>
          </div>
        </div>

        {/* Bouton Actions sous le téléphone */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <TopographeActions
            userId={user.id}
            username={`${user.firstName} ${user.lastName}`}
            userEmail={user.email}
            isActive={user.isActive}
            onAction={onUserAction}
          />
        </div>

        {/* Spécialisation avec retour à la ligne */}
        <div style={{ marginBottom: '1rem' }}>
          <small style={{ color: '#6c757d' }}>Spécialisation:</small>
          <p style={{
            marginBottom: 0,
            fontWeight: '500',
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            lineHeight: '1.4'
          }}>
            {user.specialization}
          </p>
        </div>

        {/* Statistiques */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            ...badgeStyle,
            backgroundColor: '#17a2b8',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            <User size="12px" style={{ marginRight: '0.25rem' }} />
            {user.totalClients} clients
          </span>
          <span style={{
            ...badgeStyle,
            backgroundColor: '#ffc107',
            color: '#212529',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            <Users size="12px" style={{ marginRight: '0.25rem' }} />
            {user.totalTechniciens} techniciens
          </span>
          <span style={{
            ...badgeStyle,
            backgroundColor: 'grey',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            <Briefcase size="12px" style={{ marginRight: '0.25rem' }} />
            {user.totalProjects} projets
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TopographeMobileCard;