import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Eye, Edit, Trash, Play, Square, Pause, X, BarChart2 } from 'react-feather';
import { useNavigate } from 'react-router-dom';

interface ProjectActionsProps {
  projectId: number;
  projectName: string;
  projectStatus: string;
  onAction?: (action: string, projectId: number) => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ 
  projectId, 
  projectName, 
  projectStatus,
  onAction 
}) => {
  const navigate = useNavigate();

  const handleAction = (action: string) => {
    if (action === 'view') {
      navigate(`/projects/${projectId}`);
      return;
    }
    onAction?.(action, projectId);
  };

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
      <span className="badge" style={{ backgroundColor: config.bg, color: 'white' }}>
        {config.text}
      </span>
    );
  };

  const getProjectIcon = (name: string): JSX.Element => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
      '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43'
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const color = colors[Math.abs(hash) % colors.length];
    
    return (
      <div 
        className="rounded-circle d-flex align-items-center justify-content-center me-2"
        style={{ 
          backgroundColor: color,
          width: '32px',
          height: '32px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: 'white'
        }}
      >
        <BarChart2 size="16px" />
      </div>
    );
  };

  return (
    <Dropdown>
      <Dropdown.Toggle 
        variant="light" 
        size="sm"
        id={`dropdown-${projectId}`}
      >
        Actions
      </Dropdown.Toggle>
      
      <Dropdown.Menu align="end" className="dropdown-menu-lg">
        {/* Project Header */}
        <div className="px-3 py-2 border-bottom">
          <div className="d-flex align-items-center">
            {getProjectIcon(projectName)}
            <div>
              <h6 className="mb-0 text-dark">{projectName}</h6>
              <div className="mt-1">
                {getStatusBadge(projectStatus)}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Actions */}
        <Dropdown.Item onClick={() => handleAction('view')}>
          <Eye size="15px" className="me-2" /> Voir détails
        </Dropdown.Item>
        <Dropdown.Item onClick={() => handleAction('edit')}>
          <Edit size="15px" className="me-2" /> Modifier
        </Dropdown.Item>
        
        {/* Status Actions */}
        <Dropdown.Divider />
        
        {projectStatus === 'PLANNING' && (
          <Dropdown.Item onClick={() => handleAction('start')}>
            <Play size="15px" className="me-2 text-success" />
            <span className="text-success">Démarrer</span>
          </Dropdown.Item>
        )}
        
        {projectStatus === 'IN_PROGRESS' && (
          <>
            <Dropdown.Item onClick={() => handleAction('complete')}>
              <Square size="15px" className="me-2 text-success" />
              <span className="text-success">Terminer</span>
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleAction('hold')}>
              <Pause size="15px" className="me-2 text-warning" />
              <span className="text-warning">Mettre en attente</span>
            </Dropdown.Item>
          </>
        )}
        
        {projectStatus === 'ON_HOLD' && (
          <Dropdown.Item onClick={() => handleAction('start')}>
            <Play size="15px" className="me-2 text-success" />
            <span className="text-success">Reprendre</span>
          </Dropdown.Item>
        )}
        
        {!['COMPLETED', 'CANCELLED'].includes(projectStatus) && (
          <Dropdown.Item onClick={() => handleAction('cancel')}>
            <X size="15px" className="me-2 text-danger" />
            <span className="text-danger">Annuler</span>
          </Dropdown.Item>
        )}
        
        {/* Delete Action */}
        <Dropdown.Divider />
        <Dropdown.Item onClick={() => handleAction('delete')}>
          <Trash size="15px" className="me-2 text-danger" /> 
          <span className="text-danger">Supprimer</span>
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProjectActions;