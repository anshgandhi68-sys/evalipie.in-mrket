import { db } from '../db/connection.js';
import { LedgerCustomer, LedgerEntry, LedgerEntryType, VoiceSessionState } from '../../../shared/types.js';

// Hindi / Indic colloquial number parser
export function parseIndicNumber(text: string): number | null {
  const clean = text.toLowerCase().trim();

  // 1. Direct digit match
  const digitMatch = clean.match(/\b(\d+)\b/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  // 2. Hindi word lookup
  const words = clean.split(/\s+/);
  let total = 0;
  let currentGroup = 0;

  const smallNumbers: Record<string, number> = {
    ek: 1, do: 2, teen: 3, chaar: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
    gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, unnees: 19,
    bees: 20, tees: 30, chaalis: 40, pachaas: 50, saath: 60, sattar: 70, assi: 80, nabbe: 90,
    sau: 100, hazaar: 1000, dedh: 150, dhai: 250
  };

  // Special colloquial terms
  if (clean.includes('dedh sau')) return 150;
  if (clean.includes('dhai sau')) return 250;
  if (clean.includes('dedh hazaar')) return 1500;
  if (clean.includes('dhai hazaar')) return 2500;

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (smallNumbers[w] !== undefined) {
      const val = smallNumbers[w];
      if (val === 100) {
        currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 100;
      } else if (val === 1000) {
        currentGroup = (currentGroup === 0 ? 1 : currentGroup) * 1000;
        total += currentGroup;
        currentGroup = 0;
      } else {
        currentGroup += val;
      }
    }
  }

  total += currentGroup;
  return total > 0 ? total : null;
}

export class VoiceKhataStateMachine {
  private activeSessions: Map<string, VoiceSessionState> = new Map();

  // Initialize a new voice session with mandatory First-Turn AI Disclosure
  startSession(sessionId: string, organizationId = 'org-sharma'): VoiceSessionState {
    const greeting = 'Namaste! Main Evalipie ka AI Voice Khata Assistant hoon. Main aapke udhaar aur payments record karne mein madad karunga. Boliye, kya entry karni hai?';
    
    const state: VoiceSessionState = {
      sessionId,
      stage: 'AWAITING_CONFIRMATION',
      firstTurnDisclosed: true,
      spokenResponse: greeting,
      partialTranscript: '',
      finalTranscript: ''
    };

    this.activeSessions.set(sessionId, state);
    return state;
  }

  // Process natural voice transcript
  async processTranscript(sessionId: string, transcript: string, organizationId = 'org-sharma'): Promise<VoiceSessionState> {
    let state = this.activeSessions.get(sessionId);
    if (!state) {
      state = this.startSession(sessionId, organizationId);
    }

    const startLatency = Date.now();
    const clean = transcript.toLowerCase().trim();
    state.finalTranscript = transcript;
    state.partialTranscript = transcript;

    // SCENARIO 1: Spoken Confirmation ("Haan, save kar do", "Confirm", "Yes")
    if (state.pendingTransaction && (clean.includes('haan') || clean.includes('confirm') || clean.includes('save') || clean.includes('yes') || clean.includes('theek hai'))) {
      return this.commitPendingTransaction(sessionId, organizationId, startLatency);
    }

    // SCENARIO 2: Spoken Correction ("Nahi, 430 tha", "Change amount to 430", "Amount 430")
    if (state.pendingTransaction && (clean.includes('nahi') || clean.includes('change') || clean.includes('galat') || clean.includes('tha'))) {
      const correctedAmount = parseIndicNumber(clean);
      if (correctedAmount) {
        state.pendingTransaction.amount = correctedAmount;
        state.stage = 'AWAITING_CONFIRMATION';
        state.spokenResponse = `Samajh gaya. Amount badal kar ₹${correctedAmount} kar diya hai. Ab confirm karun?`;
        state.latencyMs = Date.now() - startLatency;
        return { ...state };
      }
    }

    // SCENARIO 3: Disambiguation Response ("Indiranagar wale", "Jayanagar")
    if (state.stage === 'DISAMBIGUATING' && state.pendingTransaction) {
      const matchingCust = Array.from(db.ledgerCustomers.values()).find(c => 
        c.organizationId === organizationId &&
        c.name.toLowerCase() === state?.pendingTransaction?.customerName.toLowerCase() &&
        clean.includes(c.disambiguationTag?.toLowerCase() || '')
      );

      if (matchingCust) {
        state.pendingTransaction.customerId = matchingCust.id;
        state.pendingTransaction.customerName = `${matchingCust.name} (${matchingCust.disambiguationTag})`;
        state.stage = 'AWAITING_CONFIRMATION';
        const typeText = state.pendingTransaction.type === 'CREDIT' ? 'udhaar' : 'payment';
        state.spokenResponse = `${state.pendingTransaction.customerName} ke account mein ₹${state.pendingTransaction.amount} ${typeText} add kar raha hoon. Confirm karun?`;
        state.latencyMs = Date.now() - startLatency;
        return { ...state };
      }
    }

    // SCENARIO 4: Spoken Balance Query ("Ramesh ka total kitna baaki hai?", "Aaj kitna udhaar gaya?")
    if (clean.includes('kitna') || clean.includes('balance') || clean.includes('hisab') || clean.includes('baaki')) {
      return this.handleBalanceQuery(clean, organizationId, state, startLatency);
    }

    // SCENARIO 5: New Credit Entry (Udhaar) or Payment Entry (Jama)
    const isCredit = clean.includes('udhaar') || clean.includes('baaki') || clean.includes('likh') || clean.includes('le gaya');
    const isPayment = clean.includes('jama') || clean.includes('diya') || clean.includes('diye') || clean.includes('payment');

    if (isCredit || isPayment) {
      const type: LedgerEntryType = isCredit ? 'CREDIT' : 'PAYMENT';
      const amount = parseIndicNumber(clean);

      if (!amount) {
        state.stage = 'AWAITING_CONFIRMATION';
        state.spokenResponse = 'Customer ka naam samajh aaya, par amount clear nahi hai. Kitne rupaye record karne hain?';
        state.latencyMs = Date.now() - startLatency;
        return { ...state };
      }

      // Extract customer name
      const potentialNames = ['ramesh', 'suresh', 'priya', 'amit', 'rajesh', 'vikram'];
      let customerName = 'Customer';
      for (const name of potentialNames) {
        if (clean.includes(name)) {
          customerName = name.charAt(0).toUpperCase() + name.slice(1);
          break;
        }
      }

      // Check for duplicate customer names (Disambiguation Requirement)
      const matchingCustomers = Array.from(db.ledgerCustomers.values()).filter(c => 
        c.organizationId === organizationId && c.name.toLowerCase() === customerName.toLowerCase()
      );

      if (matchingCustomers.length > 1) {
        const tags = matchingCustomers.map(c => c.disambiguationTag || 'Branch');
        state.stage = 'DISAMBIGUATING';
        state.pendingTransaction = {
          customerName,
          amount,
          type,
          disambiguationOptions: tags
        };
        state.spokenResponse = `Do ${customerName} hain. ${tags.join(' wale ya ')} wale?`;
        state.latencyMs = Date.now() - startLatency;
        return { ...state };
      }

      const singleCustomer = matchingCustomers[0];
      state.pendingTransaction = {
        customerId: singleCustomer?.id,
        customerName: singleCustomer ? `${singleCustomer.name} (${singleCustomer.disambiguationTag || 'Local'})` : customerName,
        amount,
        type
      };

      state.stage = 'AWAITING_CONFIRMATION';
      const actionText = type === 'CREDIT' ? 'udhaar add' : 'payment receive';
      state.spokenResponse = `${state.pendingTransaction.customerName} ke account mein ₹${amount} ${actionText} ho raha hai. Confirmed?`;
      state.latencyMs = Date.now() - startLatency;
      return { ...state };
    }

    // Default Fallback
    state.stage = 'AWAITING_CONFIRMATION';
    state.spokenResponse = 'Aap "Ramesh ka 340 udhaar", "Ramesh ne 200 diye" ya "Aaj kitna udhaar gaya" bol sakte hain.';
    state.latencyMs = Date.now() - startLatency;
    return { ...state };
  }

  // Handle queries about customer balances or daily totals
  private handleBalanceQuery(clean: string, organizationId: string, state: VoiceSessionState, startLatency: number): VoiceSessionState {
    // 1. Daily Udhaar Total Query ("Aaj kitna udhaar gaya?")
    if (clean.includes('aaj') && (clean.includes('udhaar') || clean.includes('gaya'))) {
      const today = new Date().toISOString().split('T')[0];
      const todayCredits = db.ledgerEntries.filter(e => 
        e.organizationId === organizationId && e.entryType === 'CREDIT' && e.createdAt.startsWith(today)
      );
      const totalAmount = todayCredits.reduce((sum, e) => sum + e.amount, 0);

      state.stage = 'COMPLETED';
      state.spokenResponse = `Aaj total ₹${totalAmount.toLocaleString('en-IN')} ka udhaar gaya hai across ${todayCredits.length} entries.`;
      state.latencyMs = Date.now() - startLatency;
      return { ...state };
    }

    // 2. Specific Customer Balance Query ("Ramesh ka hisab batao")
    for (const cust of db.ledgerCustomers.values()) {
      if (cust.organizationId === organizationId && clean.includes(cust.name.toLowerCase())) {
        const matchingCustomers = Array.from(db.ledgerCustomers.values()).filter(c => 
          c.organizationId === organizationId && c.name.toLowerCase() === cust.name.toLowerCase()
        );

        if (matchingCustomers.length > 1) {
          state.stage = 'DISAMBIGUATING';
          state.pendingTransaction = {
            customerName: cust.name,
            amount: 0,
            type: 'CREDIT'
          };
          const tags = matchingCustomers.map(c => c.disambiguationTag || 'Local');
          state.spokenResponse = `Do ${cust.name} hain. ${tags.join(' wale ya ')} wale ka hisab chahiye?`;
          state.latencyMs = Date.now() - startLatency;
          return { ...state };
        }

        state.stage = 'COMPLETED';
        state.spokenResponse = `${cust.name} (${cust.disambiguationTag}) ka total baaki udhaar ₹${cust.currentBalance.toLocaleString('en-IN')} hai.`;
        state.latencyMs = Date.now() - startLatency;
        return { ...state };
      }
    }

    state.stage = 'COMPLETED';
    state.spokenResponse = 'Kripya customer ka naam batayein jiska balance janna hai.';
    state.latencyMs = Date.now() - startLatency;
    return { ...state };
  }

  // Commit transaction to database
  private commitPendingTransaction(sessionId: string, organizationId: string, startLatency: number): VoiceSessionState {
    const state = this.activeSessions.get(sessionId)!;
    const tx = state.pendingTransaction!;

    let customer = tx.customerId ? db.ledgerCustomers.get(tx.customerId) : undefined;
    if (!customer) {
      // Create new customer if not found
      const newCustId = `cust-${Date.now()}`;
      customer = {
        id: newCustId,
        organizationId,
        name: tx.customerName,
        currentBalance: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      db.ledgerCustomers.set(newCustId, customer);
    }

    // Calculate new balance
    if (tx.type === 'CREDIT') {
      customer.currentBalance += tx.amount;
    } else {
      customer.currentBalance = Math.max(0, customer.currentBalance - tx.amount);
    }
    db.ledgerCustomers.set(customer.id, customer);

    // Record ledger entry
    const newEntry: LedgerEntry = {
      id: `entry-${Date.now()}`,
      organizationId,
      customerId: customer.id,
      customerName: `${customer.name}${customer.disambiguationTag ? ` (${customer.disambiguationTag})` : ''}`,
      entryType: tx.type,
      amount: tx.amount,
      balanceAfter: customer.currentBalance,
      notes: `Recorded via Evalipie Voice Khata`,
      voiceSessionId: sessionId,
      createdAt: new Date().toISOString()
    };
    db.ledgerEntries.unshift(newEntry);

    state.stage = 'COMPLETED';
    state.pendingTransaction = undefined;
    const actionWord = tx.type === 'CREDIT' ? 'udhaar add ho gaya' : 'payment jama ho gayi';
    state.spokenResponse = `Entry save ho gayi hai. ${customer.name} ka total balance ab ₹${customer.currentBalance.toLocaleString('en-IN')} hai.`;
    state.latencyMs = Date.now() - startLatency;

    return { ...state };
  }
}

export const voiceKhataStateMachine = new VoiceKhataStateMachine();
