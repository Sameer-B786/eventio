import { validateRecord } from './excelValidator';
import { describe, it, expect } from 'vitest';

describe('Excel Schema Validator', () => {
  it('should reject a Faculty record if roll_no is present', () => {
    const facultyRecord = {
      institute_name: 'Test Inst',
      department: 'CS',
      name: 'John Doe',
      dob: '1980-01-01',
      emergency_mob_no: '9876543210',
      address: '123 Main St',
      photo_url: 'https://example.com/photo.jpg',
      roll_no: '12345'
    };
    
    const errors = validateRecord(facultyRecord, 'faculty');
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some(err => err.includes('Field roll_no is forbidden.') || err.includes('Faculty records must NOT contain a roll number field.'))).toBe(true);
  });

  it('should pass a valid Faculty record', () => {
    const validFacultyRecord = {
      institute_name: 'Test Inst',
      department: 'CS',
      name: 'John Doe',
      dob: '1980-01-01',
      emergency_mob_no: '9876543210',
      address: '123 Main St',
      photo_url: 'https://example.com/photo.jpg'
    };
    
    const errors = validateRecord(validFacultyRecord, 'faculty');
    expect(errors.length).toBe(0);
  });
});
