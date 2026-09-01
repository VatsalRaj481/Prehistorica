import { runDeepAuditEngine } from './runStrictDeepAudit';

runDeepAuditEngine()
  .then(() => console.log('Deep audit engine finished successfully!'))
  .catch(err => console.error('Engine error:', err));
