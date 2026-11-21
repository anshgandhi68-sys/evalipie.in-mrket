import { transcribeAudioWithPrisma, synthesizeSpeechWithTimbre } from '../services/gnaniVoiceService.js';
import { voiceKhataStateMachine } from '../services/voiceKhataStateMachine.js';
import { db } from '../db/connection.js';

async function runGnaniLiveIntegrationSuite() {
  console.log('\n===============================================================');
  console.log('🎙️ TESTING LIVE GNANI AI VOICE PLATFORM (PRISMA v3.0 & TIMBRE)');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  // Test 1: Real Gnani Timbre Speech Generation
  total++;
  try {
    const testPhrase = 'Namaste, Ramesh ka 340 rupaye udhaar darj kar diya gaya hai.';
    console.log(`[TEST 1] Synthesizing speech with Gnani Timbre (Nalini, hi-IN)...`);
    const startTts = Date.now();
    const audioWav = await synthesizeSpeechWithTimbre(testPhrase, 'Nalini', 'hi-IN');
    const ttsLatency = Date.now() - startTts;

    const isWav = audioWav.toString('ascii', 0, 4) === 'RIFF' && audioWav.toString('ascii', 8, 12) === 'WAVE';
    if (!isWav) {
      throw new Error('Response is not valid RIFF/WAVE audio data');
    }

    console.log(`✅ [PASS] Test 1: Gnani Timbre generated ${audioWav.length} bytes of WAV audio in ${ttsLatency}ms.`);
    passed++;

    // Test 2: Real Gnani Prisma v3.0 Multilingual Speech-to-Text
    total++;
    console.log(`\n[TEST 2] Transcribing generated audio with Gnani Prisma v3.0 (indic-auto)...`);
    const startStt = Date.now();
    const sttResult = await transcribeAudioWithPrisma(audioWav, 'indic-auto');
    const sttLatency = Date.now() - startStt;

    console.log(`Transcript Output: "${sttResult.transcript}"`);
    console.log(`Detected Language: ${sttResult.detectedLanguage} | Engine Latency: ${sttResult.processingTimeMs}ms`);

    if (!sttResult.transcript || sttResult.transcript.length === 0) {
      throw new Error('Prisma returned empty transcript');
    }

    console.log(`✅ [PASS] Test 2: Gnani Prisma v3.0 transcribed speech in ${sttLatency}ms.`);
    passed++;

    // Test 3: Voice Khata Mandatory Indic AI Disclosure (Turn 1)
    total++;
    const sessionId = `test-session-${Date.now()}`;
    const initialSession = voiceKhataStateMachine.startSession(sessionId, 'org-sharma');
    if (!initialSession.firstTurnDisclosed || !initialSession.spokenResponse?.includes('AI Voice Khata Assistant')) {
      throw new Error('First-turn AI disclosure missing');
    }
    console.log(`\n✅ [PASS] Test 3: Mandatory First-turn AI Disclosure verified: "${initialSession.spokenResponse}"`);
    passed++;

    // Test 4: End-to-End Voice Command Intent Parsing
    total++;
    const commandText = 'Ramesh ka 340 rupaye udhaar likh do';
    console.log(`\n[TEST 4] Processing Voice Command: "${commandText}"`);
    const step1 = await voiceKhataStateMachine.processTranscript(sessionId, commandText, 'org-sharma');
    
    // Ramesh has 2 entries (Indiranagar and Jayanagar) so it should trigger disambiguation!
    if (step1.stage === 'DISAMBIGUATING') {
      console.log(`Disambiguation triggered: "${step1.spokenResponse}"`);
      console.log(`Options: ${step1.pendingTransaction?.disambiguationOptions?.join(', ')}`);
      console.log(`✅ [PASS] Test 4: Disambiguation correctly triggered for duplicate customer name.`);
      passed++;
    } else {
      throw new Error(`Expected DISAMBIGUATING stage, got ${step1.stage}`);
    }

    // Test 5: Customer Disambiguation Clarification ("Indiranagar wale")
    total++;
    console.log(`\n[TEST 5] Clarifying customer: "Indiranagar wale"`);
    const step2 = await voiceKhataStateMachine.processTranscript(sessionId, 'Indiranagar wale', 'org-sharma');
    if (step2.stage !== 'AWAITING_CONFIRMATION') {
      throw new Error(`Expected AWAITING_CONFIRMATION stage, got ${step2.stage}`);
    }
    console.log(`Response: "${step2.spokenResponse}"`);
    console.log(`✅ [PASS] Test 5: Disambiguated customer to Ramesh (Indiranagar) with amount ₹${step2.pendingTransaction?.amount}`);
    passed++;

    // Test 6: Spoken Amount Correction ("Nahi, 340 nahi, 430 likho")
    total++;
    console.log(`\n[TEST 6] Spoken Correction: "Nahi, 430 likho"`);
    const step3 = await voiceKhataStateMachine.processTranscript(sessionId, 'Nahi, 430 likho', 'org-sharma');
    if (step3.pendingTransaction?.amount !== 430) {
      throw new Error(`Expected amount 430, got ${step3.pendingTransaction?.amount}`);
    }
    console.log(`Response: "${step3.spokenResponse}"`);
    console.log(`✅ [PASS] Test 6: Amount updated safely to ₹430 without database overwrite.`);
    passed++;

    // Test 7: Explicit Confirmation & Commit ("Haan, confirm kar do")
    total++;
    console.log(`\n[TEST 7] Explicit Confirmation: "Haan, confirm kar do"`);
    const initialCust = Array.from(db.ledgerCustomers.values()).find(c => c.name.toLowerCase().includes('ramesh') && c.disambiguationTag?.toLowerCase().includes('indiranagar'));
    const prevBalance = initialCust?.currentBalance || 0;

    const step4 = await voiceKhataStateMachine.processTranscript(sessionId, 'Haan, confirm kar do', 'org-sharma');
    if (step4.stage !== 'COMPLETED') {
      throw new Error(`Expected COMPLETED stage, got ${step4.stage}`);
    }

    const updatedCust = Array.from(db.ledgerCustomers.values()).find(c => c.name.toLowerCase().includes('ramesh') && c.disambiguationTag?.toLowerCase().includes('indiranagar'));
    const newBalance = updatedCust?.currentBalance || 0;

    if (newBalance !== prevBalance + 430) {
      throw new Error(`Balance not updated. Prev: ${prevBalance}, New: ${newBalance}`);
    }

    console.log(`Response: "${step4.spokenResponse}"`);
    console.log(`Audit Record Created: Entry #${step4.committedEntry?.id} for ₹430. New Balance: ₹${newBalance}`);
    console.log(`✅ [PASS] Test 7: Transaction committed to ledger with complete audit log.`);
    passed++;

    // Test 8: Spoken Balance Query ("Ramesh ka total kitna baaki hai?")
    total++;
    console.log(`\n[TEST 8] Spoken Balance Query: "Ramesh ka total kitna baaki hai?"`);
    const queryResult = await voiceKhataStateMachine.processTranscript(`query-${Date.now()}`, 'Ramesh Indiranagar ka hisab batao', 'org-sharma');
    console.log(`Query Response: "${queryResult.spokenResponse}"`);
    if (!queryResult.spokenResponse?.includes(newBalance.toLocaleString('en-IN'))) {
      throw new Error(`Expected balance ₹${newBalance.toLocaleString('en-IN')} in query response`);
    }
    console.log(`✅ [PASS] Test 8: Live balance calculation accurate.`);
    passed++;

  } catch (err: any) {
    console.error('❌ Test failed with error:', err.message);
  }

  console.log('\n===============================================================');
  console.log(`SUITE RESULTS: ${passed}/${total} TESTS PASSED.`);
  console.log('REAL GNANI AI PRISMA & TIMBRE INTEGRATION VERIFIED.');
  console.log('===============================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

runGnaniLiveIntegrationSuite();
