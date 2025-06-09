import React from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import { Calendar, User, Clock, CheckCircle, BarChart2 } from 'react-feather';
import { Link } from 'react-router-dom';
import ProjectActions from './ProjectActions';
import { Project } from '../types';
import { useAuth } from '../../../../../AuthContext';

interface ProjectMobileCardProps {
  project: Project;
  onProjectAction?: (action: string, projectId: number) => void;
}

const getStatusBadge = (status: string) => {
  const statusConfig = {
    PLANNING: { bg: '#6c757d', text: 'Planification' },
    IN_PROGRESS: { bg: '#007bff', text: 'En cours' },
    ON_HOLD: { bg: '#ffc107', text: 'En attente' },
    COMPLETED: { bg: '#28a745', text: 'Terminé' },
    CANCELLED: { bg: '#dc3545', text: 'Annulé' }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PLANNING;

  return (
    <small style={{
      backgroundColor: config.bg,
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem'
    }}>
      {config.text}
    </small>
  );
};

const getHealthStatusBadge = (healthStatus: string) => {
  const healthConfig = {
    GOOD: { bg: '#28a745', text: '✓ Bon' },
    WARNING: { bg: '#ffc107', text: '⚠ Attention' },
    CRITICAL: { bg: '#dc3545', text: '⚠ Critique' }
  };

  const config = healthConfig[healthStatus as keyof typeof healthConfig] || healthConfig.GOOD;

  return (
    <small style={{
      backgroundColor: config.bg,
      color: 'white',
      padding: '0.25rem 0.5rem',
      borderRadius: '0.25rem',
      fontSize: '0.75rem'
    }}>
      {config.text}
    </small>
  );
};

const getProjectColor = (name: string): string => {
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

const ProjectMobileCard: React.FC<ProjectMobileCardProps> = ({ project, onProjectAction }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  
  const projectColor = getProjectColor(project.name);
  
  const progressVariant = project.progressPercentage >= 75 ? 'success' :
                         project.progressPercentage >= 50 ? 'info' :
                         project.progressPercentage >= 25 ? 'warning' : 'danger';

  const cardStyle: React.CSSProperties = {
    marginBottom: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    border: '1px solid #dee2e6'
  };

  return (
    <Card style={cardStyle} className="mb-3">
      <Card.Body style={{ padding: '1rem' }}>
        {/* Header avec icône et nom */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <Link 
            to={`/projects/${project.id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                backgroundColor: projectColor,
                width: '50px',
                height: '50px',
                borderRadius: '8px',
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
              <BarChart2 size="24px" />
            </div>
          </Link>
          <div style={{ flexGrow: 1 }}>
            <h6 style={{ marginBottom: '0.25rem', fontWeight: 'bold' }}>
              <Link 
                to={`/projects/${project.id}`}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = '#007bff'}
                onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}
              >
                {project.name}
              </Link>
            </h6>
            <p style={{ marginBottom: '0.25rem', color: '#6c757d', fontSize: '0.875rem' }}>
              {project.description.length > 60 
                ? `${project.description.substring(0, 60)}...`
                : project.description
              }
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {getStatusBadge(project.status)}
              {getHealthStatusBadge(project.healthStatus)}
            </div>
          </div>
        </div>

        {/* Informations du client et topographe */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <User size="14px" style={{ marginRight: '0.5rem' }} />
            <span>Client: <strong>{project.clientName}</strong></span>
            {project.clientCompanyName && (
              <span style={{ marginLeft: '0.5rem' }}>({project.clientCompanyName})</span>
            )}
          </div>
          
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
              <User size="14px" style={{ marginRight: '0.5rem' }} />
              <span>Topographe: <strong>{project.topographeName}</strong></span>
              <span style={{ marginLeft: '0.5rem' }}>({project.topographeLicenseNumber})</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <Calendar size="14px" style={{ marginRight: '0.5rem' }} />
            <div>
              <small>Début:</small><br />
              <strong>{formatDate(project.startDate)}</strong>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', color: '#6c757d', fontSize: '0.875rem' }}>
            <Calendar size="14px" style={{ marginRight: '0.5rem' }} />
            <div>
              <small>Fin:</small><br />
              <strong>{formatDate(project.endDate)}</strong>
            </div>
          </div>
        </div>

        {/* Progression */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <small style={{ fontWeight: 'bold' }}>
              <CheckCircle size="14px" style={{ marginRight: '0.25rem' }} />
              Progression
            </small>
            <small>{Math.round(project.progressPercentage)}%</small>
          </div>
          <ProgressBar 
            variant={progressVariant}
            now={project.progressPercentage}
            style={{ height: '8px', marginBottom: '0.5rem' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <small style={{ color: '#6c757d' }}>
              {project.completedTasks}/{project.totalTasks} tâches terminées
            </small>
            {project.daysRemaining !== 0 && (
              <small style={{ color: project.isOverdue ? '#dc3545' : '#17a2b8' }}>
                <Clock size="12px" style={{ marginRight: '0.25rem' }} />
                {project.isOverdue ? `En retard de ${Math.abs(project.daysRemaining)}j` : `${project.daysRemaining}j restants`}
              </small>
            )}
          </div>
        </div>

        {/* Techniciens assignés */}
        {project.assignedTechniciensCount > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <small style={{ color: '#6c757d' }}>
              Techniciens assignés: <strong>{project.assignedTechniciensCount}</strong>
            </small>
            {project.assignedTechniciensNames && (
              <p style={{ 
                marginBottom: 0, 
                marginTop: '0.25rem',
                fontSize: '0.875rem',
                color: '#6c757d',
                whiteSpace: 'normal',
                wordWrap: 'break-word'
              }}>
                {project.assignedTechniciensNames}
              </p>
            )}
          </div>
        )}

        {/* Message de santé du projet */}
        {project.healthMessage && (
          <div style={{ marginBottom: '1rem' }}>
            <small style={{ 
              color: project.healthStatus === 'CRITICAL' ? '#dc3545' : 
                     project.healthStatus === 'WARNING' ? '#856404' : '#155724',
              fontStyle: 'italic'
            }}>
              {project.healthMessage}
            </small>
          </div>
        )}

        {/* Bouton Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <ProjectActions
            projectId={project.id}
            projectName={project.name}
            projectStatus={project.status}
            onAction={onProjectAction}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectMobileCard;