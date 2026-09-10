// Utility for formatting currency, dates, and Bengali text

const BENGALI_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(num: number | string): string {
  const str = String(num);
  return str.replace(/[0-9]/g, (digit) => BENGALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * Formats a number to Bangladeshi Taka style with Indian numbering system (e.g. 1,00,000)
 */
export function formatTaka(amount: number, inBengaliDigits = true): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    amount = 0;
  }
  const absoluteAmount = Math.round(Math.abs(amount));
  
  // Format with South Asian comma separator: ##,##,###
  const numStr = absoluteAmount.toString();
  let result = '';
  if (numStr.length <= 3) {
    result = numStr;
  } else {
    const last3 = numStr.substring(numStr.length - 3);
    const remaining = numStr.substring(0, numStr.length - 3);
    const withCommas = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = withCommas + ',' + last3;
  }

  if (inBengaliDigits) {
    const bengaliNum = toBengaliNumber(result);
    return `৳${bengaliNum}`;
  }
  
  return `৳${result}`;
}

export function formatTakaEnglish(amount: number): string {
  return formatTaka(amount, false);
}

export const BENGALI_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const BENGALI_DAYS_SHORT = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

export function getBengaliMonthYear(year: number, monthIndex: number): string {
  const month = BENGALI_MONTHS[monthIndex] || '';
  const yr = toBengaliNumber(year);
  return `${month} ${yr}`;
}

/**
 * Format date in clear Bangla (e.g. ১০ সেপ্টেম্বর, ২০২৬ or ১০/০৯/২০২৬)
 */
export function formatBengaliDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    const day = toBengaliNumber(date.getDate().toString().padStart(2, '0'));
    const month = BENGALI_MONTHS[date.getMonth()];
    const year = toBengaliNumber(date.getFullYear());
    return `${day} ${month}, ${year}`;
  } catch {
    return isoDateString;
  }
}

export function formatBengaliTime(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'বিকাল' : 'সকাল';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${period} ${toBengaliNumber(hours)}:${toBengaliNumber(formattedMinutes)}`;
  } catch {
    return '';
  }
}

export function getTodayDateBangla(): string {
  const today = new Date();
  const days = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const dayName = days[today.getDay()];
  return `${dayName}, ${formatBengaliDate(today.toISOString())}`;
}

/**
 * Check if a date string is today
 */
export function isToday(isoDateString: string): boolean {
  const date = new Date(isoDateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date string is in the current month
 */
export function isThisMonth(isoDateString: string): boolean {
  const date = new Date(isoDateString);
  const today = new Date();
  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}
