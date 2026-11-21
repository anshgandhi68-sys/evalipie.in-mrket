import { Request, Response } from 'express';
import { db } from '../db/connection.js';
import { voiceKhataStateMachine } from '../services/voiceKhataStateMachine.js';

export const voiceKhataController = {
  // GET /api/ledger/customers
  getCustomers: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customers = Array.from(db.ledgerCustomers.values())
      .filter(c => c.organizationId === orgId)
      .sort((a, b) => b.currentBalance - a.currentBalance);
    res.json({ status: 'success', data: customers });
  },

  // GET /api/ledger/entries
  getEntries: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customerId = req.query.customerId as string;
    
    let entries = db.ledgerEntries.filter(e => e.organizationId === orgId);
    if (customerId) {
      entries = entries.filter(e => e.customerId === customerId);
    }

    res.json({ status: 'success', data: entries });
  },

  // GET /api/ledger/summary
  getSummary: (req: Request, res: Response) => {
    const orgId = (req.query.orgId as string) || 'org-sharma';
    const customers = Array.from(db.ledgerCustomers.values()).filter(c => c.organizationId === orgId);
    const totalOutstandingUdhaar = customers.reduce((sum, c) => sum + c.currentBalance, 0);

    const today = new Date().toISOString().split('T')[0];
    const todayEntries = db.ledgerEntries.filter(e => e.organizationId === orgId && e.createdAt.startsWith(today));
    const todayCreditGiven = todayEntries.filter(e => e.entryType === 'CREDIT').reduce((sum, e) => sum + e.amount, 0);
    const todayPaymentReceived = todayEntries.filter(e => e.entryType === 'PAYMENT').reduce((sum, e) => sum + e.amount, 0);

    res.json({
      status: 'success',
      data: {
        totalOutstandingUdhaar,
        todayCreditGiven,
        todayPaymentReceived,
        totalActiveCustomers: customers.length
      }
    });
  },

  // POST /api/voice/process-text (Voice Command Processor via REST fallback)
  processVoiceText: async (req: Request, res: Response) => {
    const { sessionId, text, orgId } = req.body;
    if (!text) {
      return res.status(400).json({ status: 'error', message: 'Voice text is required' });
    }

    const sId = sessionId || `vs-rest-${Date.now()}`;
    const state = await voiceKhataStateMachine.processTranscript(sId, text, orgId || 'org-sharma');
    res.json({ status: 'success', data: state });
  }
};
