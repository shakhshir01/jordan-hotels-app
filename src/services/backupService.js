/**
 * Database Backup Service
 * Handles automated backups, snapshots, and restoration
 */

import { api } from './api';
import { logger } from './monitoringService';

/**
 * Backup Manager
 */
export class BackupManager {
  constructor(options = {}) {
    this.apiUrl = options.apiUrl || '/api/backups';
    this.backups = [];
    this.backupSchedule = null;
    this.autoBackupInterval = options.autoBackupInterval || 86400000; // 24 hours
  }

  /**
   * Create immediate backup
   */
  async createBackup(name = null) {
    try {
      const backupName = name || `backup-${Date.now()}`;

      logger.info('Creating database backup', { name: backupName });

      const response = await api.post(`${this.apiUrl}/create`, {
        name: backupName,
        timestamp: new Date().toISOString(),
      });

      logger.info('Backup created successfully', { backupId: response.data.id });
      return response.data;
    } catch (error) {
      logger.error('Failed to create backup', { error: error.message });
      throw error;
    }
  }

  /**
   * Schedule automatic backups
   */
  scheduleAutomaticBackups(interval = this.autoBackupInterval) {
    if (this.backupSchedule) {
      clearInterval(this.backupSchedule);
    }

    this.backupSchedule = setInterval(async () => {
      try {
        await this.createBackup();
      } catch (error) {
        logger.error('Scheduled backup failed', { error: error.message });
      }
    }, interval);

    logger.info('Automatic backups scheduled', { interval });
  }

  /**
   * Stop automatic backups
   */
  stopAutomaticBackups() {
    if (this.backupSchedule) {
      clearInterval(this.backupSchedule);
      this.backupSchedule = null;
      logger.info('Automatic backups stopped');
    }
  }

  /**
   * Get list of backups
   */
  async listBackups(limit = 10, offset = 0) {
    try {
      const response = await api.get(
        `${this.apiUrl}?limit=${limit}&offset=${offset}`
      );
      this.backups = response.data;
      return response.data;
    } catch (error) {
      logger.error('Failed to list backups', { error: error.message });
      throw error;
    }
  }

  /**
   * Get backup details
   */
  async getBackupDetails(backupId) {
    try {
      const response = await api.get(`${this.apiUrl}/${backupId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get backup details', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Restore from backup
   */
  async restoreFromBackup(backupId, confirmPhrase = '') {
    try {
      // Safety check - require confirmation
      if (confirmPhrase !== 'CONFIRM RESTORE') {
        throw new Error('Invalid confirmation phrase');
      }

      logger.warn('Starting database restoration', { backupId });

      const response = await api.post(`${this.apiUrl}/${backupId}/restore`, {
        timestamp: new Date().toISOString(),
      });

      logger.info('Database restored successfully', { backupId });
      return response.data;
    } catch (error) {
      logger.error('Failed to restore backup', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Delete backup
   */
  async deleteBackup(backupId) {
    try {
      logger.info('Deleting backup', { backupId });

      await api.delete(`${this.apiUrl}/${backupId}`);

      logger.info('Backup deleted successfully', { backupId });
    } catch (error) {
      logger.error('Failed to delete backup', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Export backup
   */
  async exportBackup(backupId) {
    try {
      const response = await api.get(`${this.apiUrl}/${backupId}/export`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup-${backupId}.sql.gz`);
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      logger.info('Backup exported successfully', { backupId });
    } catch (error) {
      logger.error('Failed to export backup', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Get backup status
   */
  async getBackupStatus(backupId) {
    try {
      const response = await api.get(`${this.apiUrl}/${backupId}/status`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get backup status', { backupId, error: error.message });
      throw error;
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    try {
      const response = await api.get(`${this.apiUrl}/stats`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get backup stats', { error: error.message });
      throw error;
    }
  }
}

/**
 * Incremental Backup Strategy
 */
export class IncrementalBackup {
  constructor(lastBackupTime = null) {
    this.lastBackupTime = lastBackupTime;
    this.changes = [];
  }

  /**
   * Capture changes since last backup
   */
  captureChanges(changes) {
    this.changes = changes;
  }

  /**
   * Create incremental backup
   */
  async createIncremental() {
    return {
      type: 'incremental',
      basedOn: this.lastBackupTime,
      changes: this.changes,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Backup Retention Policy
 */
export const backupRetentionPolicy = {
  daily: 7, // Keep 7 daily backups
  weekly: 4, // Keep 4 weekly backups
  monthly: 12, // Keep 12 monthly backups
  yearly: 5, // Keep 5 yearly backups

  /**
   * Determine if backup should be retained
   */
  shouldRetain(backup) {
    const now = new Date();
    const backupDate = new Date(backup.timestamp);
    const diffDays = (now - backupDate) / (1000 * 60 * 60 * 24);

    // Always keep recent backups
    if (diffDays <= 1) return true;

    // Keep daily backups for a week
    if (diffDays <= 7) {
      const backupDay = backupDate.getDate();
      const lastBackupOfDay = backup.isLastOfDay;
      return lastBackupOfDay;
    }

    // Keep weekly backups for a month
    if (diffDays <= 30) {
      const backupWeek = Math.floor(diffDays / 7);
      return backupWeek % 1 === 0; // One per week
    }

    // Keep monthly backups for a year
    if (diffDays <= 365) {
      const backupMonth = backupDate.getMonth();
      return backup.isLastOfMonth;
    }

    // Keep yearly backups
    const backupYear = backupDate.getFullYear();
    return backup.isLastOfYear;
  },

  /**
   * Cleanup old backups
   */
  async cleanup(backups) {
    const toDelete = backups.filter((b) => !this.shouldRetain(b));
    return toDelete;
  },
};

/**
 * React Hook for Backups
 */
export const useBackupManager = () => {
  const [backups, setBackups] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const managerRef = React.useRef(new BackupManager());

  const listBackups = async () => {
    setLoading(true);
    try {
      const data = await managerRef.current.listBackups();
      setBackups(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (name) => {
    try {
      const backup = await managerRef.current.createBackup(name);
      setBackups((prev) => [backup, ...prev]);
      return backup;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const restoreBackup = async (backupId) => {
    try {
      await managerRef.current.restoreFromBackup(backupId, 'CONFIRM RESTORE');
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  React.useEffect(() => {
    listBackups();
  }, []);

  return {
    backups,
    loading,
    error,
    listBackups,
    createBackup,
    restoreBackup,
    manager: managerRef.current,
  };
};

export default {
  BackupManager,
  IncrementalBackup,
  backupRetentionPolicy,
  useBackupManager,
};
