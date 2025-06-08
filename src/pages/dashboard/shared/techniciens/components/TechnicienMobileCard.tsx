// components/TechnicienMobileCard.tsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { Phone, MapPin, User, Tool, Calendar, Award } from 'react-feather';
import { Link } from 'react-router-dom';
import TechnicienActions from './TechnicienActions';
import { Technicien } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface TechnicienMobileCardProps {
  technicien: Technicien;
  onTechnicienAction?: (action: string, technicienId: number) => void;
}

const getSkillLevelBadge = (skillLevel: string) => {
    const badges = {
      JUNIOR: { bg: '#17a2b8', text: 'Junior', icon: <Award size="12px" style={{ marginRight: '4px' }} /> },
      SENIOR: { bg: '#28a745', text: 'Senior', icon: <Award size="12px" style={{ marginRight: '4px' }} /> },
      EXPERT: { bg: '#dc3545', text: 'Expert', icon: <Award size="12px" style={{ marginRight: '4px' }} /> }
    };
  
    const badge = badges[skillLevel as keyof typeof badges] || badges.JUNIOR;
  
    return (
      <small
        style={{
          backgroundColor: badge.bg,
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '0.25rem',
          display: 'inline-flex',
          alignItems: 'center',
        }}
      >
        {badge.icon}
        {badge.text}
      </small>
    );
  };

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

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

const TechnicienMobileCard: React.FC<TechnicienMobileCardProps> = ({ technicien, onTechnicienAction }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const avatarColor = getAvatarColor(`${technicien.firstName} ${technicien.lastName}`);
  const initials = getInitials(`${technicien.firstName} ${technicien.lastName}`);

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
            to={`/techniciens/${technicien.id}`}
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
                to={`/techniciens/${technicien.id}`}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#007bff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
              >
                {technicien.firstName} {technicien.lastName}
              </Link>
            </h6>
            <p style={{ marginBottom: '0.25rem', color: '#6c757d', fontSize: '0.875rem' }}>
              <a 
                href={`mailto:${technicien.email}`}
                style={{ color: '#6c757d', textDecoration: 'none' }}
              >
                {technicien.email}
              </a>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {getStatusBadge(technicien.isActive)}
              {getSkillLevelBadge(technicien.skillLevel)}
            </div>
          </div>
        </div>

        {/* Informations détaillées */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <Phone size="14px" style={{ marginRight: '0.5rem' }} />
            <a 
              href={`tel:${technicien.phoneNumber}`}
              style={{ color: '#6c757d', textDecoration: 'none' }}
            >
              {technicien.phoneNumber}
            </a>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <MapPin size="14px" style={{ marginRight: '0.5rem' }} />
            <span>{technicien.cityName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'flex-start', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <User size="14px" style={{ marginRight: '0.5rem' }} />
                  <span>Affecté à: {technicien.assignedToTopographeName}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '2rem' }}>
                  <Calendar size="12px" style={{ marginRight: '0.25rem' }} />
                  <small style={{ color: '#6c757d' }}>
                    {formatDate(technicien.createdAt)}
                  </small>
                </div>
              </div>
            ) : (
              <>
                <Calendar size="14px" style={{ marginRight: '0.5rem' }} />
                <span>Créé le: {formatDate(technicien.createdAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Spécialités si disponibles */}
        {technicien.specialties && (
          <div style={{ marginBottom: '1rem' }}>
            <small style={{ color: '#6c757d' }}>Spécialités:</small>
            <p style={{
              marginBottom: 0,
              fontWeight: '500',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              lineHeight: '1.4'
            }}>
              {technicien.specialties}
            </p>
          </div>
        )}

        {/* Bouton Actions */}
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <TechnicienActions
            technicienId={technicien.id}
            technicienName={`${technicien.firstName} ${technicien.lastName}`}
            technicienEmail={technicien.email}
            isActive={technicien.isActive}
            onAction={onTechnicienAction}
          />
        </div>

        {/* Statistiques des tâches */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{
            ...badgeStyle,
            backgroundColor: '#17a2b8',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            <Tool size="12px" style={{ marginRight: '0.25rem' }} />
            {technicien.totalTasks} tâches
          </span>
          <span style={{
            ...badgeStyle,
            backgroundColor: '#28a745',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            ▶ {technicien.activeTasks} actives
          </span>
          <span style={{
            ...badgeStyle,
            backgroundColor: '#6c757d',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.25rem'
          }}>
            ✓ {technicien.completedTasks} finis
          </span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TechnicienMobileCard;