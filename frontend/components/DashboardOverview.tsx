"use client";

import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Search,
} from "lucide-react";

const resources = [
  "Documentation",
  "API reference",
  "FAQs",
  "Forum - DNS and health checks",
  "Forum - Domain name registration",
  "Request a limit increase",
];

export default function DashboardOverview() {
  return (
    <div className="dashboard-page">
      <DashboardHeader />
      <OverviewPanel />
      <RegisterDomain />
      <Notifications />
      <MoreResources />
      <ServiceHealth />
    </div>
  );
}

function DashboardHeader() {
  return (
    <h1>
      Route 53 Dashboard <span className="info-text">Info</span>
    </h1>
  );
}

function OverviewPanel() {
  return (
    <section className="overview-panel">
      <div>
        <h2>DNS management</h2>
        <strong className="metric">1</strong>
        <p>Hosted zone</p>
      </div>

      <div>
        <h2>Availability monitoring</h2>
        <p>
          Health checks monitor your applications and
          <br />
          web resources, and direct DNS queries to
          <br />
          healthy resources.
        </p>
        <button className="outline-button">Create health check</button>
      </div>

      <div>
        <h2>Traffic management</h2>
        <p>
          A visual tool that lets you easily create
          <br />
          policies for multiple endpoints in complex
          <br />
          configurations.
        </p>
        <button className="outline-button">Create policy</button>
      </div>

      <div>
        <h2>Domain registration</h2>
        <strong className="error-metric">Error</strong>
        <p>Domains</p>
      </div>
    </section>
  );
}

function RegisterDomain() {
  return (
    <section className="console-panel register-panel">
      <h2>Register domain</h2>

      <p>
        Find and register an available domain, or{" "}
        <a>transfer your existing domains</a> to Route 53.
      </p>

      <input placeholder="Enter a domain name" />

      <small>
        Each label (each part between dots) can be up to 63 characters long
        and must start with a-z or 0-9. Maximum length: 255 characters,
        including dots. Valid characters: a-z, 0-9, and - (hyphen)
      </small>

      <button className="outline-button compact">Check</button>
    </section>
  );
}

function Notifications() {
  return (
    <section className="console-panel notifications">
      <div className="section-title">
        <h2>Notifications</h2>
        <RefreshCw size={24} className="refresh-icon" />
      </div>

      <div className="notification-toolbar">
        <div className="console-search">
          <Search size={17} />
          <i>Find notifications</i>
        </div>

        <div className="pagination">
          <ChevronLeft />
          <strong>1</strong>
          <ChevronRight />
        </div>
      </div>

      <div className="notification-head">
        <span>Resource</span>
        <span>Status</span>
        <span>Last update</span>
      </div>

      <div className="notification-empty">
        No notifications to display
      </div>
    </section>
  );
}

function MoreResources() {
  return (
    <section className="console-panel resource-panel">
      <h2>
        More resources <ExternalLink size={16} />
      </h2>

      {resources.map((resource) => (
        <a key={resource}>{resource}</a>
      ))}
    </section>
  );
}

function ServiceHealth() {
  return (
    <section className="console-panel service-health">
      <h2>Service health</h2>

      <p>
        To view the current status of Route 53, see the{" "}
        <a>
          AWS Service Health Dashboard{" "}
          <ExternalLink size={14} />
        </a>
        .
      </p>
    </section>
  );
}