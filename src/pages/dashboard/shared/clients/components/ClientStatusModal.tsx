// src/pages/dashboard/shared/clients/components/ClientStatusModal.tsx

import React, { useEffect } from 'react';
import { Modal, Button, Alert, Spinner } from 'react-bootstrap';
import { ToggleLeft, ToggleRight } from 'react-feather';
import { Client } from '../types';
import { useClientActions } from '../hooks/useClientActions';

interface ClientStatusModalProps {
  show: boolean;
  onHide: () => void;
  client: Client | null;
  action: 'activate' | 'deactivate';
  onSuccess?: () => void;
}

const ClientStatusModal: React.FC<ClientStatusModalProps> = ({
  show,
  onHide,
  client,
  action,
  onSuccess
}) => {
  const { loading, error, activateClient, deactivateClient, resetState } = useClientActions();

  const isActivating = action === 'activate';
  const actionText = isActivating ? 'activer' : 'désactiver';
  const Icon = isActivating ? ToggleRight : ToggleLeft;
  const variant = isActivating ? 'success' : 'warning';

  // Debug: Log when modal opens
  useEffect(() => {
    if (show && client) {
      console.log('ClientStatusModal opened:', {
        action,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        currentStatus: client.isActive
      });
    }
  }, [show, client, action]);

  const handleAction = async () => {
    if (!client) {
      console.error('No client selected');
      return;
    }

    console.log(`Executing ${action} for client ${client.id}`);

    try {
      const success = isActivating 
        ? await activateClient(client.id)
        : await deactivateClient(client.id);

      console.log(`${action} result:`, success);

      if (success) {
        console.log('Action successful, calling onSuccess');
        onSuccess?.();
        onHide();
        resetState();
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    }
  };

  const handleClose = () => {
    console.log('Closing ClientStatusModal');
    resetState();
    onHide();
  };

  if (!client) {
    console.warn('ClientStatusModal: No client provided');
    return null;
  }

  console.log('Rendering ClientStatusModal:', {
    show,
    action,
    loading,
    error,
    clientId: client.id
  });

  const getClientTypeLabel = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return 'Particulier';
      case 'COMPANY': return 'Entreprise';
      case 'GOVERNMENT': return 'Gouvernement';
      default: return type;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className={`d-flex align-items-center text-${variant}`}>
          <Icon size="24px" className="me-2" />
          {isActivating ? 'Activer' : 'Désactiver'} le client
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">
            <Alert.Heading>Erreur</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        <div className="d-flex align-items-center mb-3">
          <div 
            className={`rounded-circle d-flex align-items-center justify-content-center me-3 bg-${variant}`}
            style={{ width: '48px', height: '48px' }}
          >
            <Icon size="24px" className="text-white" />
          </div>
          <div>
            <h5 className="mb-1">
              {isActivating ? 'Activer' : 'Désactiver'} le compte
            </h5>
            <p className="mb-0 text-muted">
              {client.firstName} {client.lastName}
            </p>
            <small className="text-muted">
              Statut actuel: {client.isActive ? 'Actif' : 'Inactif'}
            </small>
          </div>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Informations du client :</h6>
          <ul className="mb-0">
            <li><strong>Nom :</strong> {client.firstName} {client.lastName}</li>
            <li><strong>Email :</strong> {client.email}</li>
            <li><strong>Type :</strong> {getClientTypeLabel(client.clientType)}</li>
            {client.companyName && <li><strong>Entreprise :</strong> {client.companyName}</li>}
            <li><strong>Projets actifs :</strong> {client.activeProjects}</li>
            <li><strong>Créé par :</strong> {client.createdByTopographeName}</li>
          </ul>
        </div>

        <div className="bg-light p-3 rounded mb-3">
          <p className="mb-0">
            {isActivating ? (
              <>
                Le client pourra à nouveau accéder au système et ses projets 
                redeviendront visibles et accessibles.
              </>
            ) : (
              <>
                Le client ne pourra plus accéder au système. Ses projets resteront 
                visibles mais seront marqués comme inactifs.
              </>
            )}
          </p>
        </div>

        <p className="text-muted">
          Voulez-vous {actionText} ce client ?
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button 
          variant="outline-secondary" 
          onClick={handleClose}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button 
          variant={variant}
          onClick={handleAction}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {isActivating ? 'Activation...' : 'Désactivation...'}
            </>
          ) : (
            <>
              <Icon size="16px" className="me-2" />
              {isActivating ? 'Activer' : 'Désactiver'}
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ClientStatusModal;