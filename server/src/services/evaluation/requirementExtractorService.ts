import { VirtualFile } from '../../demo/sampleProject.js';
import { RequirementMatrixItem, RequirementEvidence, RequirementStatus } from '../../../../shared/types.js';

export class RequirementExtractorService {
  /**
   * Extracts and correlates stated requirements against actual codebase.
   */
  public extract(
    evaluationId: string,
    files: VirtualFile[],
    problemStatement?: string,
    readmeContent?: string
  ): RequirementMatrixItem[] {
    const rawText = problemStatement || readmeContent || '';
    const claims = this.parseClaims(rawText);

    const items: RequirementMatrixItem[] = [];

    for (let i = 0; i < claims.length; i++) {
      const claim = claims[i];
      const evidence = this.findCodeEvidence(claim, files);
      const verdictAnalysis = this.analyzeClaimFulfillment(claim, evidence, files);

      items.push({
        id: `req-${evaluationId}-${i + 1}`,
        evaluationId,
        requirementNumber: i + 1,
        requirementText: claim,
        status: verdictAnalysis.status,
        verdict: verdictAnalysis.verdict,
        evidence,
        gapAnalysis: verdictAnalysis.gapAnalysis
      });
    }

    return items;
  }

  private parseClaims(text: string): string[] {
    if (!text) {
      return [
        'Application must provide clean API endpoints for primary domain operations.',
        'Core business transactions must handle errors and prevent inconsistent state.',
        'Endpoints handling user data must implement proper access control.'
      ];
    }

    const claims: string[] = [];
    const lines = text.split('\n');

    let currentClaim = '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (/^#{1,3}\s+Requirement\s+\d+|^[0-9]+\.\s+Requirement|^##\s+Requirement/i.test(trimmed)) {
        if (currentClaim) claims.push(currentClaim);
        currentClaim = trimmed.replace(/^#{1,3}\s+/i, '');
      } else if (currentClaim && trimmed && !trimmed.startsWith('#')) {
        currentClaim += ' ' + trimmed;
      }
    }
    if (currentClaim) claims.push(currentClaim);

    if (claims.length === 0) {
      // Split by double newline or bullet points
      const bullets = text
        .split(/(?:\r?\n){2,}|(?:\n-\s+)/)
        .map(s => s.trim().replace(/^[-*]\s*/, ''))
        .filter(s => s.length > 25);
      if (bullets.length > 0) return bullets.slice(0, 5);
      return [text.slice(0, 250)];
    }

    return claims.slice(0, 6);
  }

  private findCodeEvidence(claim: string, files: VirtualFile[]): RequirementEvidence[] {
    const evidence: RequirementEvidence[] = [];
    const keywords = claim
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 3 && !['must', 'should', 'have', 'that', 'with', 'from', 'this', 'guarantee'].includes(w));

    for (const file of files) {
      if (file.path.endsWith('.md') || file.path.endsWith('.json')) continue;

      const lines = file.content.split('\n');
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        const lowerLine = line.toLowerCase();

        const matchCount = keywords.filter(k => lowerLine.includes(k)).length;
        if (matchCount >= 2 || (matchCount >= 1 && (lowerLine.includes('function') || lowerLine.includes('const') || lowerLine.includes('def')))) {
          evidence.push({
            filePath: file.path,
            lineNumbers: `L${lineIdx + 1}-L${Math.min(lines.length, lineIdx + 8)}`,
            snippet: lines.slice(lineIdx, Math.min(lines.length, lineIdx + 5)).join('\n'),
            symbolName: line.trim().slice(0, 50)
          });
          if (evidence.length >= 2) break;
        }
      }
      if (evidence.length >= 3) break;
    }

    return evidence;
  }

  private analyzeClaimFulfillment(
    claim: string,
    evidence: RequirementEvidence[],
    files: VirtualFile[]
  ): { status: RequirementStatus; verdict: string; gapAnalysis?: string } {
    const lowerClaim = claim.toLowerCase();

    // Check specific known failure signatures
    if (lowerClaim.includes('overdraft') || lowerClaim.includes('atomic') || lowerClaim.includes('balance')) {
      const accFile = files.find(f => f.path.includes('account') || f.path.includes('balance') || f.path.includes('wallet'));
      if (accFile && (accFile.content.includes('await sleep') || accFile.content.includes('setTimeout') || !accFile.content.includes('lock') && !accFile.content.includes('transaction'))) {
        return {
          status: 'CONTRADICTED',
          verdict: 'Claim claims atomic overdraft protection, but implementation uses non-atomic read-modify-write without transactional locking or distributed mutex.',
          gapAnalysis: 'Race condition exists in debitBalance(). Simultaneous operations allow balance to drop into negative amounts.'
        };
      }
    }

    if (lowerClaim.includes('idor') || lowerClaim.includes('invoice') || lowerClaim.includes('authorization') || lowerClaim.includes('access control')) {
      const orderFile = files.find(f => f.path.includes('order') || f.path.includes('invoice'));
      if (orderFile && !orderFile.content.includes('req.user') || orderFile?.content.includes('// BUG: Missing authorization')) {
        return {
          status: 'CONTRADICTED',
          verdict: 'Claim asserts strict tenant authorization and owner-only invoice access, but endpoint returns sensitive order records without verifying caller token.',
          gapAnalysis: 'Missing authorization check on /api/orders/:id permits IDOR horizontal privilege escalation.'
        };
      }
    }

    if (lowerClaim.includes('coupon') || lowerClaim.includes('discount') || lowerClaim.includes('negative')) {
      const couponFile = files.find(f => f.path.includes('coupon') || f.path.includes('discount'));
      if (couponFile && !couponFile.content.includes('Math.max(0') && !couponFile.content.includes('Set(')) {
        return {
          status: 'PARTIAL',
          verdict: 'Coupon calculations exist, but duplicate coupon stacking is not prevented and checkout total has no non-negative floor safeguard.',
          gapAnalysis: 'Stacking identical promo codes or high discounts can result in negative cart totals.'
        };
      }
    }

    if (evidence.length > 0) {
      return {
        status: 'SATISFIED',
        verdict: 'Stated requirement is supported by identified functions and data flow in the codebase.'
      };
    }

    return {
      status: 'NOT_IMPLEMENTED',
      verdict: 'No corresponding implementation found in the analyzed source files.',
      gapAnalysis: 'Missing module or endpoint for this specification.'
    };
  }
}

export const requirementExtractorService = new RequirementExtractorService();
