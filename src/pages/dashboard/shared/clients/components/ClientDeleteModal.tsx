// src/pages/dashboard/shared/clients/components/ClientDeleteModal.tsx

import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { Trash2, AlertTriangle } from 'react-feather';
import { Client } from '../types';
import { useClientActions } from '../hooks/useClientActions';

interface ClientDeleteModalProps {
  show: boolean;
  onHide: () => void;
  client: Client | null;
  onSuccess?: () => void;
}

const ClientDeleteModal: React.FC<ClientDeleteModalProps> = ({
  show,
  onHide,
  client,
  onSuccess
}) => {
  const { loading, error, deleteClient, resetState } = useClientActions();

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && client) {
      console.log('ClientDeleteModal opened:', {
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        totalProjects: client.totalProjects,
        activeProjects: client.activeProjects
      });
    }
  }, [show, client]);

  const handleDelete = async () => {
    if (!client) {
      console.error('No client selected for deletion');
      return;
    }

    console.log(`Executing delete for client ${client.id}`);

    try {
      const success = await deleteClient(client.id);
      console.log('Delete result:', success);

      if (success) {
        console.log('Delete successful, calling onSuccess');
        onSuccess?.();
        onHide();
        resetState();
      }
    } catch (err) {
      console.error('Error during delete:', err);
    }
  };

  const handleClose = () => {
    console.log('Closing ClientDeleteModal');
    resetState();
    onHide();
  };

  if (!client) {
    console.warn('ClientDeleteModal: No client provided');
    return null;
  }

  const canDelete = client.totalProjects === 0;

  console.log('Rendering ClientDeleteModal:', {
    show,
    loading,
    error,
    clientId: client.id,
    canDelete
  });

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center text-danger">
          <Trash2 size="24px" className="me-2" />
          Supprimer le client
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <div className="d-flex align-items-start mb-3">
          <AlertTriangle size="48px" className="text-warning me-3 flex-shrink-0" />
          <div>
            <h5>Attention !</h5>
            <p className="mb-0">
              Vous êtes sur le point de supprimer définitivement le client{' '}
              <strong>{client.firstName} {client.lastName}</strong>.
            </p>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du client :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {client.firstName} {client.lastName}</li>
            <li><strong>Email :</strong> {client.email}</li>
            <li><strong>Type :</strong> {client.clientType}</li>
            {client.companyName && <li><strong>Entreprise :</strong> {client.companyName}</li>}
            <li><strong>Projets totaux :</strong> {client.totalProjects}</li>
            <li><strong>Projets actifs :</strong> {client.activeProjects}</li>
            <li><strong>Projets terminés :</strong> {client.completedProjects}</li>
            <li><strong>Créé par :</strong> {client.createdByTopographeName}</li>
          </ul>
        </div>

        {!canDelete ? (
          <Alert variant="danger" className="mb-3">
            <strong>Suppression impossible !</strong><br />
            Ce client a {client.totalProjects} projet(s) associé(s).
            Vous devez d'abord supprimer ou réassigner tous les projets avant de pouvoir supprimer ce client.
          </Alert>
        ) : (
          <Alert variant="warning" className="mb-3">
            <strong>Note :</strong> Cette action est <strong>irréversible</strong>. 
            Toutes les données associées à ce client seront définitivement perdues.
          </Alert>
        )}

        <p className="text-muted">
          {canDelete 
            ? "Êtes-vous sûr de vouloir continuer ?" 
            : "Supprimez ou réassignez d'abord tous les projets."}
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          {canDelete ? 'Annuler' : 'Fermer'}
        </Button>
        {canDelete && (
          <Button 
            variant="danger" 
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 size="16px" className="me-2" />
                Supprimer définitivement
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ClientDeleteModal;