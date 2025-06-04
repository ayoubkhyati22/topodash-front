// import node module libraries
import { Col, Row, Container } from "react-bootstrap";

const Client = () => {
  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} sm={12}>
          <div className="border-bottom pb-4 mb-4 d-md-flex justify-content-between align-items-center">
            <div className="mb-3 mb-md-0">
              <h1 className="mb-0 h2 fw-bold">
                Gestion des clients
              </h1>
              <p className="mb-0">
                Gestion de vos clients.
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Client;
