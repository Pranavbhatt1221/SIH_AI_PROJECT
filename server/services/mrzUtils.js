/**
 * ICAO Doc 9303 MRZ Mathematical Utilities
 * Implements standard 7-3-1 modulus-10 check digit algorithms.
 */

function calculateIcaoCheckDigit(dataStr) {
  const weights = [7, 3, 1];
  let total = 0;
  const upper = (dataStr || '').toUpperCase();
  for (let i = 0; i < upper.length; i++) {
    const char = upper[i];
    let val = 0;
    if (char >= '0' && char <= '9') {
      val = parseInt(char, 10);
    } else if (char >= 'A' && char <= 'Z') {
      val = char.charCodeAt(0) - 65 + 10;
    } else if (char === '<') {
      val = 0;
    }
    total += val * weights[i % 3];
  }
  return String(total % 10);
}

function parseTD3PassportMRZ(line1, line2) {
  if (!line1 || !line2) return null;

  const l1 = line1.replace(/\s+/g, '').toUpperCase();
  const l2 = line2.replace(/\s+/g, '').toUpperCase();

  const docType = l1.substring(0, 2);
  const countryCode = l1.substring(2, 5);

  const namesSection = l1.substring(5).split('<<');
  const surname = (namesSection[0] || '').replace(/</g, ' ').trim();
  const givenNames = (namesSection[1] || '').replace(/</g, ' ').trim();
  const fullName = `${givenNames} ${surname}`.trim();

  const docNumber = l2.substring(0, 9).replace(/</g, '');
  const docCheckDigit = l2[9] || '0';
  const expectedDocCheck = calculateIcaoCheckDigit(l2.substring(0, 9));
  const isDocNumberValid = (docCheckDigit === expectedDocCheck);

  const nationality = l2.substring(10, 13);
  const rawDob = l2.substring(13, 19);
  const dobCheckDigit = l2[19] || '0';
  const expectedDobCheck = calculateIcaoCheckDigit(rawDob);
  const isDobValid = (dobCheckDigit === expectedDobCheck);

  let formattedDob = "";
  if (rawDob.length === 6 && /^\d+$/.test(rawDob)) {
    const yy = parseInt(rawDob.substring(0, 2), 10);
    const mm = rawDob.substring(2, 4);
    const dd = rawDob.substring(4, 6);
    const century = yy > 30 ? "19" : "20";
    formattedDob = `${dd}/${mm}/${century}${rawDob.substring(0, 2)}`;
  }

  const gender = l2[20] || 'M';
  const rawExp = l2.substring(21, 27);
  const expCheckDigit = l2[27] || '0';
  const expectedExpCheck = calculateIcaoCheckDigit(rawExp);
  const isExpValid = (expCheckDigit === expectedExpCheck);

  let formattedExp = "";
  if (rawExp.length === 6 && /^\d+$/.test(rawExp)) {
    formattedExp = `${rawExp.substring(4, 6)}/${rawExp.substring(2, 4)}/20${rawExp.substring(0, 2)}`;
  }

  const isCompositeValid = isDocNumberValid && isDobValid && isExpValid;

  return {
    mrz_type: "TD3 (2-Line ICAO Standard Passport)",
    line1: l1,
    line2: l2,
    document_type: "Passport",
    full_name: fullName,
    surname: surname,
    given_names: givenNames,
    document_number: docNumber,
    nationality: nationality,
    date_of_birth: formattedDob,
    gender: gender,
    expiry_date: formattedExp,
    checks: {
      document_number_check: { extracted: docCheckDigit, calculated: expectedDocCheck, valid: isDocNumberValid },
      date_of_birth_check: { extracted: dobCheckDigit, calculated: expectedDobCheck, valid: isDobValid },
      expiry_date_check: { extracted: expCheckDigit, calculated: expectedExpCheck, valid: isExpValid },
      composite_check: { valid: isCompositeValid }
    },
    composite_valid: isCompositeValid
  };
}

module.exports = {
  calculateIcaoCheckDigit,
  parseTD3PassportMRZ
};
