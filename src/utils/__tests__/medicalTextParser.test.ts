// Medical Text Parser Tests
// Verify Georgian medical text extraction functionality

import { describe, it, expect } from 'vitest';
import {
  parseGeorgianMedicalHistory,
  insertBriefAnamnesisIntoForm100,
  validateMedicalReportStructure
} from '../medicalTextParser';

describe('Medical Text Parser', () => {
  describe('parseGeorgianMedicalHistory', () => {
    it('should extract text between anamnesis and objective status markers', () => {
      const mockReport = `
        პაციენტის ინფორმაცია: 45 წლის მამაკაცი

        ანამნეზი და ჩივილები:
        პაციენტი კუნთუშით გულმკერდის ტკივილით, რომელიც დაიწყო 2 საათის წინ.
        ტკივილი გადადის მარცხენა მხარზე და ყბაზე.
        თან ახლავს ოფლიანობა და გულისრევა.

        ობიექტური სტატუსი:
        AP: 140/90 mmHg
        HR: 95 bpm

        დიაგნოზი: STEMI
      `;

      const result = parseGeorgianMedicalHistory(mockReport);

      expect(result).toBeTruthy();
      expect(result).toContain('პაციენტი კუნთუშით გულმკერდის ტკივილით');
      expect(result).toContain('ოფლიანობა და გულისრევა');
      expect(result).not.toContain('ობიექტური სტატუსი');
    });

    it('should handle case-insensitive markers', () => {
      const mockReport = `
        ᲐᲜᲐᲛᲜᲔᲖᲘ ДА ᲩᲘᲕᲘᲚᲔᲑᲘ:
        პაციენტის ჩივილები აქ არის

        ᲝᲑᲘᲔᲥᲢᲣᲠᲘ ᲡᲢᲐᲢᲣᲡᲘ:
        ობიექტური მონაცემები
      `;

      const result = parseGeorgianMedicalHistory(mockReport);

      expect(result).toBeTruthy();
      expect(result).toContain('პაციენტის ჩივილები');
    });

    it('should return null when markers are not found', () => {
      const mockReport = 'Some random text without proper markers';

      const result = parseGeorgianMedicalHistory(mockReport);

      expect(result).toBeNull();
    });

    it('should handle empty or null input', () => {
      expect(parseGeorgianMedicalHistory('')).toBeNull();
      expect(parseGeorgianMedicalHistory(null as any)).toBeNull();
    });

    it('should clean excessive whitespace', () => {
      const mockReport = `
        ანამნეზი და ჩივილები:
        პაციენტი    კუნთუშით    გულმკერდის    ტკივილით.



        მრავალი ხაზი.

        ობიექტური სტატუსი:
        მონაცემები
      `;

      const result = parseGeorgianMedicalHistory(mockReport);

      expect(result).toBeTruthy();
      expect(result).not.toContain('    '); // No excessive spaces
      expect(result).not.toMatch(/\n\n\n/); // No excessive newlines
    });
  });

  describe('insertBriefAnamnesisIntoForm100', () => {
    it('should insert brief anamnesis before disease progression section with markdown', () => {
      const form100 = `
        პაციენტის ინფორმაცია:
        45 წლის, მამრობითი სქესი

        **ავადმყოფობის მიმდინარეობა:**
        პაციენტი მიღებულია გადაუდებელ განყოფილებაში...

        მკურნალობა:
        ასპირინი 300 მგ
      `;

      const briefAnamnesis = 'პაციენტი კუნთუშით გულმკერდის ტკივილით, რომელიც დაიწყო 2 საათის წინ.';

      const result = insertBriefAnamnesisIntoForm100(form100, briefAnamnesis);

      expect(result).toContain('**მოკლე ანამნეზი:**');
      expect(result).toContain(briefAnamnesis);

      // Check that disease progression marker is still properly formatted
      expect(result).toContain('**ავადმყოფობის მიმდინარეობა:**');

      // Check that brief anamnesis comes before disease progression
      const anamnesisIndex = result.indexOf('მოკლე ანამნეზი');
      const progressionIndex = result.indexOf('ავადმყოფობის მიმდინარეობა');

      expect(anamnesisIndex).toBeLessThan(progressionIndex);
    });

    it('should preserve markdown formatting in extracted anamnesis text', () => {
      const form100 = `
        **ავადმყოფობის მიმდინარეობა:**
        შემდგომი მონაცემები
      `;

      const briefAnamnesis = '**ტესტი** ანამნეზი **bold text**';

      const result = insertBriefAnamnesisIntoForm100(form100, briefAnamnesis);

      expect(result).toContain('**მოკლე ანამნეზი:**');
      // Check that bold formatting is preserved from anamnesis content
      expect(result).toContain('**ტესტი**');
      expect(result).toContain('**bold text**');
    });

    it('should handle case-insensitive disease progression markers', () => {
      const form100 = `
        **ᲐᲕᲐᲓᲛᲧᲝᲤᲝᲑᲘᲡ ᲛᲘᲛᲓᲘᲜᲐᲠᲔᲝᲑᲐ:**
        შემდგომი მონაცემები
      `;

      const briefAnamnesis = 'ტესტი ანამნეზი';

      const result = insertBriefAnamnesisIntoForm100(form100, briefAnamnesis);

      expect(result).toContain('**მოკლე ანამნეზი:**');
      expect(result).toContain(briefAnamnesis);
    });

    it('should append at end if marker not found', () => {
      const form100 = 'Some Form 100 content without markers';
      const briefAnamnesis = 'ტესტი ანამნეზი';

      const result = insertBriefAnamnesisIntoForm100(form100, briefAnamnesis);

      expect(result).toContain('**მოკლე ანამნეზი:**');
      expect(result).toContain(briefAnamnesis);
    });

    it('should return original text if no brief anamnesis provided', () => {
      const form100 = 'Original Form 100 content';

      const result1 = insertBriefAnamnesisIntoForm100(form100, null);
      const result2 = insertBriefAnamnesisIntoForm100(form100, '');

      expect(result1).toBe(form100);
      expect(result2).toBe(form100);
    });
  });

  describe('validateMedicalReportStructure', () => {
    it('should validate reports with key medical markers', () => {
      const validReport = `
        ანამნეზი: პაციენტის ჩივილები
        დიაგნოზი: STEMI
        მკურნალობა: ასპირინი
      `;

      expect(validateMedicalReportStructure(validReport)).toBe(true);
    });

    it('should reject invalid or empty reports', () => {
      expect(validateMedicalReportStructure('')).toBe(false);
      expect(validateMedicalReportStructure('random text')).toBe(false);
      expect(validateMedicalReportStructure(null as any)).toBe(false);
    });

    it('should be case-insensitive', () => {
      const validReport = 'ᲐᲜᲐᲛᲜᲔᲖᲘ: test data';
      expect(validateMedicalReportStructure(validReport)).toBe(true);
    });
  });

  describe('Integration: Parse and Insert', () => {
    it('should parse and insert medical history into Form 100 with proper markdown formatting', () => {
      const erReport = `
        პაციენტი: 52 წლის მამაკაცი

        ანამნეზი და ჩივილები:
        პაციენტი მიღებულია კუნთუშით გულმკერდის ტკივილით, რომელიც დაიწყო 3 საათის წინ.
        ტკივილი იყო წნევის ხასიათის, გადადიოდა მარცხენა მხარზე.
        თან ახლავდა ოფლიანობა, გულისრევა და სუნთქვის გაძნელება.

        ობიექტური სტატუსი:
        AP: 150/95 mmHg
        HR: 102 bpm
      `;

      const form100Template = `
        პაციენტის ინფორმაცია:
        52 წლის, მამრობითი სქესი

        **ავადმყოფობის მიმდინარეობა:**
        პაციენტი მიღებულია გადაუდებელ განყოფილებაში STEMI-ის ეჭვით.

        მკურნალობა:
        ასპირინი 300 მგ, კლოპიდოგრელი 600 მგ
      `;

      // Step 1: Parse medical history from ER report
      const medicalHistory = parseGeorgianMedicalHistory(erReport);
      expect(medicalHistory).toBeTruthy();
      expect(medicalHistory).toContain('გულმკერდის ტკივილით');

      // Step 2: Insert into Form 100
      const enhancedForm100 = insertBriefAnamnesisIntoForm100(form100Template, medicalHistory!);

      // Verify structure
      expect(enhancedForm100).toContain('**მოკლე ანამნეზი:**');
      expect(enhancedForm100).toContain('გულმკერდის ტკივილით');
      expect(enhancedForm100).toContain('ოფლიანობა, გულისრევა');

      // Verify markdown formatting is preserved for section headers
      expect(enhancedForm100).toContain('**ავადმყოფობის მიმდინარეობა:**');

      // Verify order: anamnesis before disease progression
      const anamnesisIndex = enhancedForm100.indexOf('მოკლე ანამნეზი');
      const progressionIndex = enhancedForm100.indexOf('ავადმყოფობის მიმდინარეობა');
      expect(anamnesisIndex).toBeLessThan(progressionIndex);
    });
  });
});
