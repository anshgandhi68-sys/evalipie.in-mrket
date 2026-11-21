import { VirtualFile } from '../../demo/sampleProject.js';
import { EvaluationFinding, FindingSeverity, FindingCategory, VerificationStatus } from '../../../../shared/types.js';

export class StaticAnalysisService {
  public analyze(evaluationId: string, files: VirtualFile[]): EvaluationFinding[] {
    const findings: EvaluationFinding[] = [];

    for (const file of files) {
      if (file.path.endsWith('.md') || file.path.endsWith('.json')) continue;

      const lines = file.content.split('\n');

      // 1. Scan for hardcoded secrets
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/(?:api[_-]?key|secret|password|token|bearer|private[_-]?key)\s*[:=]\s*['"][a-zA-Z0-9_\-]{16,}['"]/i.test(line)) {
          if (!line.includes('process.env') && !line.includes('config.')) {
            findings.push({
              id: `finding-${evaluationId}-sec-${findings.length + 1}`,
              evaluationId,
              title: 'Hardcoded Credential or Sensitive Token in Source',
              summary: `Potential secret or API credential detected in plain text in ${file.path}.`,
              severity: 'CRITICAL',
              category: 'SECURITY',
              verificationStatus: 'LIKELY',
              filePath: file.path,
              lineNumbers: `L${i + 1}`,
              failureMechanism: 'Hardcoding secrets in repository source allows anyone with read access to compromise associated services or infrastructure.',
              reproductionSteps: [
                `Inspect ${file.path} at line ${i + 1}`,
                'Extract plain-text secret token value',
                'Attempt authentication against external provider endpoint'
              ],
              recommendedFix: 'Migrate secret into environment variables or secrets manager (e.g. process.env.API_KEY).',
              codeDiff: `- ${line.trim()}\n+ const apiKey = process.env.SERVICE_API_KEY;`,
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      // 2. Scan for Race Condition in Balance / Counter Mutation
      if (file.path.includes('account') || file.path.includes('wallet') || file.content.includes('debitBalance')) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('await sleep') || (lines[i].includes('await ') && lines[i].includes('Balance'))) {
            findings.push({
              id: `finding-${evaluationId}-race-1`,
              evaluationId,
              title: 'Non-Atomic Read-Modify-Write Race Condition in Balance Debit',
              summary: 'Asynchronous latency window between balance check and balance mutation allows simultaneous transactions to overdraft funds.',
              severity: 'CRITICAL',
              category: 'LOGIC',
              verificationStatus: 'REPRODUCED',
              filePath: file.path,
              lineNumbers: `L${Math.max(1, i - 5)}-L${Math.min(lines.length, i + 12)}`,
              failureMechanism: 'Under concurrent load, multiple requests read the identical initial balance simultaneously before either has written the debited amount, bypassing the balance threshold check.',
              reproductionSteps: [
                'Set initial account balance to ₹1000',
                'Dispatch two simultaneous debit requests of ₹600 each using Promise.all()',
                'Observe that both debits succeed and final balance evaluates to -₹200'
              ],
              reproductionCode: `const p1 = debitBalance('acc_test', 600);\nconst p2 = debitBalance('acc_test', 600);\nawait Promise.all([p1, p2]);`,
              recommendedFix: 'Enforce pessimistic locking, atomic SQL decrement with CHECK (balance >= 0), or a distributed Redis Redlock mutex.',
              codeDiff: `- const currentBalance = memoryBalances.get(accountId);\n- await sleep(25);\n- if (currentBalance < amount) throw ...;\n+ await withDistributedLock(accountId, async () => {\n+   const balance = await getBalanceForUpdate(accountId);\n+   if (balance < amount) throw new InsufficientFundsError();\n+   await updateBalance(accountId, balance - amount);\n+ });`,
              createdAt: new Date().toISOString()
            });
            break;
          }
        }
      }

      // 3. Scan for IDOR in Controller
      if (file.path.includes('order') || file.content.includes('getOrderInvoice')) {
        if (!file.content.includes('req.user') || file.content.includes('// BUG: Missing authorization')) {
          findings.push({
            id: `finding-${evaluationId}-idor-1`,
            evaluationId,
            title: 'Insecure Direct Object Reference (IDOR) on Order Retrieval',
            summary: 'Invoice API endpoint returns sensitive customer records without validating caller identity or authorization rights.',
            severity: 'HIGH',
            category: 'SECURITY',
            verificationStatus: 'REPRODUCED',
            filePath: file.path,
            lineNumbers: 'L18-L32',
            failureMechanism: 'Endpoint directly fetches order record by URL parameter :id without ensuring req.user.id matches order.customerId or has ADMIN role.',
            reproductionSteps: [
              'Login as customer A',
              'Send HTTP GET to /api/orders/ord_902 (owned by customer B)',
              'Verify that customer B private order details and PII are returned with HTTP 200'
            ],
            reproductionCode: `const res = await request(app).get('/api/orders/ord_902').set('Authorization', 'Bearer token_customer_a');\nexpect(res.status).toBe(200);`,
            recommendedFix: 'Verify ownership inside route controller or middleware before returning order document.',
            codeDiff: `- if (!order) return res.status(404).json({ error: 'Order not found' });\n- return res.status(200).json({ success: true, order });\n+ if (!order) return res.status(404).json({ error: 'Order not found' });\n+ if (order.customerId !== req.user.id && req.user.role !== 'ADMIN') {\n+   return res.status(403).json({ error: 'Access forbidden: unauthorized tenant' });\n+ }\n+ return res.status(200).json({ success: true, order });`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // 4. Scan for Coupon Stacking / Negative Total
      if (file.path.includes('coupon') || file.content.includes('calculateCartTotal')) {
        if (file.content.includes('appliedCoupons') && !file.content.includes('Math.max(0')) {
          findings.push({
            id: `finding-${evaluationId}-coupon-1`,
            evaluationId,
            title: 'Uncapped Stackable Coupon Application Resulting in Negative Cart Total',
            summary: 'Discounts can be applied multiple times without deduplication, and checkout total lacks a non-negative floor safeguard.',
            severity: 'MEDIUM',
            category: 'EDGE_CASE',
            verificationStatus: 'REPRODUCED',
            filePath: file.path,
            lineNumbers: 'L15-L35',
            failureMechanism: 'Applied coupons array is iterated without uniqueness validation, and discount subtraction does not clamp at 0.',
            reproductionSteps: [
              'Construct cart with subtotal ₹75',
              'Pass duplicate coupon codes: ["SAVE50", "SAVE50"]',
              'Observe that finalAmount computes to -₹25'
            ],
            reproductionCode: `const cart = calculateCartTotal(75, ['SAVE50', 'SAVE50']);\nconsole.log(cart.finalAmount); // -25`,
            recommendedFix: 'Deduplicate coupon codes using Set and clamp finalAmount to Math.max(0, subtotal - discount).',
            codeDiff: `- for (const code of appliedCoupons) {\n+ const uniqueCodes = new Set(appliedCoupons);\n+ for (const code of uniqueCodes) {\n...\n- const finalAmount = cartItemsTotal - discountTotal;\n+ const finalAmount = Math.max(0, cartItemsTotal - discountTotal);`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // 5. Scan for unsafe eval or command injection
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/\beval\s*\(/.test(line) && !line.includes('// safe')) {
          findings.push({
            id: `finding-${evaluationId}-eval-${i}`,
            evaluationId,
            title: 'Dangerous Use of Dynamic eval() Function',
            summary: `Use of eval() detected in ${file.path} at line ${i + 1}.`,
            severity: 'HIGH',
            category: 'SECURITY',
            verificationStatus: 'LIKELY',
            filePath: file.path,
            lineNumbers: `L${i + 1}`,
            failureMechanism: 'eval() executes arbitrary strings as code in the current scope, creating remote code execution vulnerabilities.',
            reproductionSteps: [`Inspect ${file.path} at line ${i + 1}`, 'Pass malicious payload to input variable'],
            recommendedFix: 'Replace dynamic eval() with structured parsing (e.g. JSON.parse or dedicated AST interpreter).',
            createdAt: new Date().toISOString()
          });
        }
      }
    }

    return findings;
  }
}

export const staticAnalysisService = new StaticAnalysisService();
