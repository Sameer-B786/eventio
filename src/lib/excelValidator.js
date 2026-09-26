export const schemas = {
  k12: {
    name: { required: true, type: 'string' },
    class: { required: true, type: 'string' },
    dob: { required: true, type: 'date' },
    emergency_mob_no: { required: true, type: 'phone' },
    address: { required: true, type: 'string' },
    roll_no: { required: true, type: 'string' },
    photo_url: { required: true, type: 'url' },
  },
  ugpg: {
    institute_name: { required: true, type: 'string' },
    course: { required: true, type: 'string' },
    usn_roll_no: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    dob: { required: true, type: 'date' },
    emergency_mob_no: { required: true, type: 'phone' },
    address: { required: true, type: 'string' },
    photo_url: { required: true, type: 'url' },
  },
  faculty: {
    institute_name: { required: true, type: 'string' },
    department: { required: true, type: 'string' },
    name: { required: true, type: 'string' },
    dob: { required: true, type: 'date' },
    emergency_mob_no: { required: true, type: 'phone' },
    address: { required: true, type: 'string' },
    photo_url: { required: true, type: 'url' },
    roll_no: { forbidden: true },
    usn: { forbidden: true },
  },
  eventpass: {
    event_name: { required: true, type: 'string' },
    attendee_name: { required: true, type: 'string' },
    role: { required: true, type: 'role' },
    roll_no: { required: false, type: 'string' },
  }
};

export function validateRecord(record, schemaType) {
  const schema = schemas[schemaType];
  if (!schema) throw new Error("Invalid schema type");

  let errors = [];
  
  for (const [key, rules] of Object.entries(schema)) {
    const val = record[key];

    if (rules.forbidden && val !== undefined && val !== null && val !== '') {
       errors.push(`Field ${key} is forbidden.`);
    }

    if (rules.required && (val === undefined || val === null || val === '')) {
      errors.push(`Field ${key} is required.`);
      continue;
    }

    if (val !== undefined && val !== null && val !== '') {
      if (rules.type === 'phone') {
         if (!/^\d{10,15}$/.test(String(val).replace(/\s+/g, ''))) {
            errors.push(`Field ${key} must be a valid 10-15 digit numeric phone format.`);
         }
      }
      if (rules.type === 'url') {
         if (!/^https?:\/\/.+/.test(String(val))) {
            errors.push(`Field ${key} must be a valid HTTP/S URL pointing to image asset.`);
         }
      }
      if (rules.type === 'role') {
         if (!['Host', 'Volunteer', 'Attendee'].includes(String(val))) {
            errors.push(`Field ${key} must be Host, Volunteer, or Attendee.`);
         }
      }
    }
  }

  if (schemaType === 'faculty') {
      if (('roll_no' in record && record.roll_no !== undefined && record.roll_no !== null && record.roll_no !== '') || 
          ('usn' in record && record.usn !== undefined && record.usn !== null && record.usn !== '')) {
          errors.push('Faculty records must NOT contain a roll number field.');
      }
  }

  return errors;
}

export function validateRecordsBulk(records, schemaType) {
    let allErrors = [];
    records.forEach((record, idx) => {
        const errors = validateRecord(record, schemaType);
        if (errors.length > 0) {
            allErrors.push(`Row ${idx + 1}: ${errors.join(' ')}`);
        }
    });
    return allErrors;
}
